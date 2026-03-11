import { useEffect, useState } from "react"
import { getRanking } from "../services/api"
import Container from "../components/Container"
import RankingTable from "../components/RankingTable"
import Podium from "../components/Podium"

function Ranking() {
  const [ranking, setRanking] = useState([])

  useEffect(() => {
    async function fetchData() {
      const data = await getRanking()
      setRanking(data)
    }

    fetchData()
  }, [])

  return (
    <Container>
        <h1 className="text-3xl font-bold text-white mb-2">
            Liga FCS Ranking
        </h1>

        <p className="text-slate-400 mb-6">
            Ranking geral dos duelistas da Liga FCS - Feira Championship Series
        </p>

    <Podium ranking={ranking} />

    <RankingTable ranking={ranking} />
    </Container>
  )
}

export default Ranking