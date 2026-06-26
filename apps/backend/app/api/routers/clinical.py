from fastapi import APIRouter, HTTPException, Query
import httpx
import logging
import time
from typing import Dict, Any

router = APIRouter()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ICD10_BASE_URL = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search"
# NIH RxNorm REST Endpoint
RXNORM_BASE_URL = "https://rxnav.nlm.nih.gov/REST/drugs.json"

# In-memory search cache (type, lower_q) -> (timestamp, results)
CLINICAL_CACHE: Dict[tuple, tuple] = {}
CACHE_TTL = 300  # 5 minutes TTL in seconds

@router.get("/search")
async def search_clinical_data(
    q: str = Query(..., min_length=1),
    type: str = Query(..., regex="^(icd10|rxnorm)$")
):
    """
    Proxy endpoint to search for ICD-10 codes or RxNorm medications with 5m TTL caching.
    """
    query_clean = q.strip().lower()
    cache_key = (type, query_clean)
    current_time = time.time()
    
    # Return from cache if valid
    if cache_key in CLINICAL_CACHE:
        cached_time, cached_data = CLINICAL_CACHE[cache_key]
        if current_time - cached_time < CACHE_TTL:
            logger.info(f"Cache HIT for clinical query: {query_clean} ({type})")
            return cached_data

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            if type == "icd10":
                # NIH Clinical Tables API for ICD-10-CM
                # Returns: [total_results, codes, null, descriptions]
                params = {"terms": q, "max": 10}
                response = await client.get(ICD10_BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
                
                results = []
                if len(data) >= 4:
                    codes = data[1]
                    descriptions = data[3]
                    for code, desc in zip(codes, descriptions):
                        results.append({"code": code, "name": f"{code} - {desc}"})
                
                CLINICAL_CACHE[cache_key] = (current_time, results)
                return results

            elif type == "rxnorm":
                # NIH RxNav API for Drugs
                params = {"name": q}
                response = await client.get(RXNORM_BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
                
                results = []
                drug_group = data.get("drugGroup", {})
                concept_group = drug_group.get("conceptGroup", [])
                
                for group in concept_group:
                    concepts = group.get("conceptProperties", [])
                    for concept in concepts:
                        results.append({
                            "rxcui": concept.get("rxcui"),
                            "name": concept.get("name"),
                            "synonym": concept.get("synonym")
                        })
                
                # Limit to top 15 results and deduplicate by name
                unique_results = []
                seen_names = set()
                for res in results:
                    if res["name"] not in seen_names:
                        unique_results.append(res)
                        seen_names.add(res["name"])
                
                final_results = unique_results[:15]
                CLINICAL_CACHE[cache_key] = (current_time, final_results)
                return final_results

        except httpx.HTTPStatusError as e:
            logger.error(f"External API error: {e}")
            raise HTTPException(status_code=e.response.status_code, detail="Error fetching data from clinical provider")
        except Exception as e:
            logger.error(f"Unexpected error in clinical search: {e}")
            raise HTTPException(status_code=500, detail="Internal server error during clinical search")
