import { setWaveSceneOverride, TIER_CONFIGS } from "@/lib/wave";
import { useEffect } from "react";

export default function Tier2CSuite () {
    useEffect(() => {
    setWaveSceneOverride(TIER_CONFIGS[1])
    return () => setWaveSceneOverride(null)
  }, [])
    return (
        <>
        Tier 2 C Suite Setup
        </>
    )
}