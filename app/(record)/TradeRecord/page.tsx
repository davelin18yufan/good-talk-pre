import DateFilter from "../DateFilter"
import TradeLog from "../TradeLog"
import TradePlan from "../TradePlan"
import TradeSummary from "../TradeSummary"
import RealizedPnLChart from "../RealizedPnLChart"
import ProfitChart from "../ProfitChart"
import TradeFundBase from "../TradeFundBase"

import { getPositionCurrentPrices } from "@/actions/fugle"
import { cn } from "@/utils"
import { getPosition } from "@/database/asset.action"
import { Asset, CurrentPrice, User } from "@/types/fugle.t"

const dummyData = {
  user_id: "1",
  username: "Dave",
  email: "test@example.com",
  asset: {
    _id: "123",
    totalCost: 200000,
    totalMarketPrice: 213214,
    position: [
      {
        asset_id: "3006",
        asset_name: "晶豪科",
        quantity: 3000,
        cost: 91,
      },
      {
        asset_id: "3443",
        asset_name: "創意",
        quantity: 2000,
        cost: 1437.5,
      },
    ],
  },
}

const user: User = {
  id: "1",
  username: "user1",
  email: "user1@example.com",
  availableCapital: 300000,
  createdAt: new Date(),
  updatedAt: new Date(),
  leverage: true,
}

export default async function TradeRecord() {
  // TODO:Fetch User
  // *Get positions 庫存
  const assets = await getPosition(dummyData.user_id)

  // *Get current position market price 庫存現價
  const symbols = assets?.map((item) => item.target)
  const currentPrices = await getPositionCurrentPrices(symbols)

  // *Total market value 庫存總市值
  const totalMarketValue = currentPrices?.reduce((acc, cur) => {
    const asset = assets?.find((a) => a.target === cur.symbol)
    const quantity = asset?.quantity ?? 0 // type safe
    return acc + cur.closePrice * quantity
  }, 0)

  // *Unrealized profit 庫存損益
  const calculateProfit = (asset: Asset, currentPrices: CurrentPrice[]) => {
    const { target, quantity, entryPrice } = asset
    const marketValue = currentPrices.find((c) => c.symbol === target)
    return marketValue ? quantity * (marketValue.closePrice - entryPrice) : 0
  }
  const unrealizedAssets = assets.map((a) => ({
    ...a,
    profit: calculateProfit(a, currentPrices),
  }))

  // *totalInvestmentCost = Total assets cost(For calculating profit) 持有商品的入手成本(計算損益)
  // *availableCapital = Remaining cash 可用現金
  const totalInvestmentCost = assets.reduce(
    (acc, cur) => acc + cur.cost * cur.quantity,
    0
  )

  // *totalActualInvestCost = actual spending cost of holding assets.(leverage counted, for calculating capitalRatio)
  // *實際總投入成本（包含槓桿,計算資金水位用）
  const totalActualInvestmentCost = assets.reduce(
    (acc, cur) => cur.cost * cur.quantity + acc,
    0
  )

  return (
    <div className="flex flex-col">
      <main
        className={cn(
          "container mx-auto my-4",
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
          "gap-4 px-2 md:px-4"
        )}
      >
        {/* 庫存 */}
        <TradeSummary
          assets={unrealizedAssets}
          currentPrices={currentPrices}
          layout="col-span-1 md:col-span-2 lg:col-span-1"
        />

        {/* 已實現紀錄 */}

        {/* 資金水位圓餅圖 */}
        <TradeFundBase
          layout="col-span-1 md:col-span-2"
          availableCapital={user.availableCapital}
          totalInvestmentCost={totalInvestmentCost}
          totalActualInvestmentCost={totalActualInvestmentCost}
          leverageUsed={user.leverage}
        />

        {/* 已實現的績效紀錄線圖 */}
        <RealizedPnLChart layout="col-span-1" />

        {/* 大盤跟已實現比較的線圖 */}
        <ProfitChart layout="col-span-1" />

        {/* 日期和進出紀錄 */}
        <div className="md:col-span-2">
          <DateFilter />
          <TradeLog />
        </div>

        {/* 交易計劃 */}
        <TradePlan layout="md:col-span-2 lg:col-span-1 h-[597px]" />

        {/* //TODO: 暫定製作覆盤紀錄及心得紀錄 */}
      </main>
    </div>
  )
}
