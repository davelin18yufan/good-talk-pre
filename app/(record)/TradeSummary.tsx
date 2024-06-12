import { RiHomeGearLine } from "react-icons/ri"
import SectionTitle from "./SectionTitle"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const TradeSummary = async ({
  asset,
}: {
  asset: {
    _id: string
    totalCost: number
    totalMarketPrice: number
    position: {
      asset_id: string
      asset_name: string
      quantity: number
      cost: number
      current: number
    }[]
  }
}) => {
  const { totalCost, totalMarketPrice, position } = asset
  const unrealizedProfit = (totalMarketPrice - totalCost).toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )

  return (
    <div className="p-4 bg-white rounded-md shadow-md relative">
      <SectionTitle
        title="我的庫存"
        icons={[
          {
            icon: RiHomeGearLine,
            iconSize: "h-5 w-5",
            name: "gear",
          },
        ]}
      />
      <p className="text-xl text-red-500 mb-4">
        未實現損益: {unrealizedProfit}
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="">ID</TableHead>
            <TableHead>標的</TableHead>
            <TableHead>成本</TableHead>
            <TableHead className="text-right">損益</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {position.map((p) => {
            const profit = ((p.current - p.cost) * p.quantity).toLocaleString(
              "en-US",
              {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }
            )
            return (
              <TableRow className="text-xs text-slate-600" key={p.asset_id}>
                <TableCell>{p.asset_id}</TableCell>
                <TableCell>{p.asset_name}</TableCell>
                <TableCell>{p.cost}</TableCell>
                <TableCell className="text-right">{profit}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default TradeSummary
