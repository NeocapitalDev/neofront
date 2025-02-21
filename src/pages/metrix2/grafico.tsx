'use client'
import React from 'react'
import { LineChart } from '@/components/ui/chart-line'

// Datos de ejemplo
const data = [
  
  {
      "date": "2024-06-30",
      "target": 110000.0,
      "balance": 100000.0,
      "high_water_mark": 100000.0,
      "equity": 100000.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 95000.0
  },
  {
      "date": "2024-07-01",
      "target": 110000.0,
      "balance": 100400.0,
      "high_water_mark": 100400.0,
      "equity": 100400.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 95380.0
  },
  {
      "date": "2024-07-02",
      "target": 110000.0,
      "balance": 98800.0,
      "high_water_mark": 100400.0,
      "equity": 98400.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 93860.0
  },
  {
      "date": "2024-07-03",
      "target": 110000.0,
      "balance": 100000.0,
      "high_water_mark": 100400.0,
      "equity": 101200.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 95000.0
  },
  {
      "date": "2024-07-04",
      "target": 110000.0,
      "balance": 100500.0,
      "high_water_mark": 100500.0,
      "equity": 100500.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 95475.0
  },
  {
      "date": "2024-07-05",
      "target": 110000.0,
      "balance": 99200.0,
      "high_water_mark": 100500.0,
      "equity": 98700.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 94240.0
  },
  {
      "date": "2024-07-06",
      "target": 110000.0,
      "balance": 100100.0,
      "high_water_mark": 100500.0,
      "equity": 100900.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 95095.0
  },
  {
      "date": "2024-07-07",
      "target": 110000.0,
      "balance": 100700.0,
      "high_water_mark": 100700.0,
      "equity": 100600.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 95665.0
  },
  {
      "date": "2024-07-08",
      "target": 110000.0,
      "balance": 101500.0,
      "high_water_mark": 101500.0,
      "equity": 100800.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 96425.0
  },
  {
      "date": "2024-07-09",
      "target": 110000.0,
      "balance": 100440.0,
      "high_water_mark": 101500.0,
      "equity": 98940.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 95418.0
  },
  {
      "date": "2024-07-10",
      "target": 110000.0,
      "balance": 100540.0,
      "high_water_mark": 101500.0,
      "equity": 100100.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 95513.0
  },
  {
      "date": "2024-07-11",
      "target": 110000.0,
      "balance": 100940.0,
      "high_water_mark": 101500.0,
      "equity": 100400.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 95893.0
  },
  {
      "date": "2024-07-12",
      "target": 110000.0,
      "balance": 101540.0,
      "high_water_mark": 101540.0,
      "equity": 100600.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 96463.0
  },
  {
      "date": "2024-07-13",
      "target": 110000.0,
      "balance": 101740.0,
      "high_water_mark": 101740.0,
      "equity": 100200.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 96653.0
  },
  {
      "date": "2024-07-14",
      "target": 110000.0,
      "balance": 100340.0,
      "high_water_mark": 101740.0,
      "equity": 98600.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 95323.0
  },
  {
      "date": "2024-07-15",
      "target": 110000.0,
      "balance": 100740.0,
      "high_water_mark": 101740.0,
      "equity": 100400.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 95703.0
  },
  {
      "date": "2024-07-16",
      "target": 110000.0,
      "balance": 101440.0,
      "high_water_mark": 101740.0,
      "equity": 100700.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 96368.0
  },
  {
      "date": "2024-07-17",
      "target": 110000.0,
      "balance": 100340.0,
      "high_water_mark": 101740.0,
      "equity": 98900.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 95323.0
  },
  {
      "date": "2024-07-18",
      "target": 110000.0,
      "balance": 101640.0,
      "high_water_mark": 101740.0,
      "equity": 101300.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 96558.0
  },
  {
      "date": "2024-07-19",
      "target": 110000.0,
      "balance": 102140.0,
      "high_water_mark": 102140.0,
      "equity": 100500.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 97033.0
  },
  {
      "date": "2024-07-20",
      "target": 110000.0,
      "balance": 102040.0,
      "high_water_mark": 102140.0,
      "equity": 99900.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 96938.0
  },
  {
      "date": "2024-07-21",
      "target": 110000.0,
      "balance": 102840.0,
      "high_water_mark": 102840.0,
      "equity": 100800.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 97698.0
  },
  {
      "date": "2024-07-22",
      "target": 110000.0,
      "balance": 101940.0,
      "high_water_mark": 102840.0,
      "equity": 99100.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 96843.0
  },
  {
      "date": "2024-07-23",
      "target": 110000.0,
      "balance": 102540.0,
      "high_water_mark": 102840.0,
      "equity": 100600.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 97413.0
  },
  {
      "date": "2024-07-24",
      "target": 110000.0,
      "balance": 102940.0,
      "high_water_mark": 102940.0,
      "equity": 100400.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 97793.0
  },
  {
      "date": "2024-07-25",
      "target": 110000.0,
      "balance": 103640.0,
      "high_water_mark": 103640.0,
      "equity": 100700.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 98458.0
  },
  {
      "date": "2024-07-26",
      "target": 110000.0,
      "balance": 102340.0,
      "high_water_mark": 103640.0,
      "equity": 98700.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 97223.0
  },
  {
      "date": "2024-07-27",
      "target": 110000.0,
      "balance": 103240.0,
      "high_water_mark": 103640.0,
      "equity": 100900.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 98078.0
  },
  {
      "date": "2024-07-28",
      "target": 110000.0,
      "balance": 103740.0,
      "high_water_mark": 103740.0,
      "equity": 100500.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 98553.0
  },
  {
      "date": "2024-07-29",
      "target": 110000.0,
      "balance": 102340.0,
      "high_water_mark": 103740.0,
      "equity": 98600.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 97223.0
  },
  {
      "date": "2024-07-30",
      "target": 110000.0,
      "balance": 103540.0,
      "high_water_mark": 103740.0,
      "equity": 101200.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 98363.0
  },
  {
      "date": "2024-07-31",
      "target": 110000.0,
      "balance": 103840.0,
      "high_water_mark": 103840.0,
      "equity": 100300.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 98648.0
  },
  {
      "date": "2024-08-01",
      "target": 110000.0,
      "balance": 103240.0,
      "high_water_mark": 103840.0,
      "equity": 99400.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 98078.0
  },
  {
      "date": "2024-08-02",
      "target": 110000.0,
      "balance": 104040.0,
      "high_water_mark": 104040.0,
      "equity": 100800.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 98838.0
  },
  {
      "date": "2024-08-03",
      "target": 110000.0,
      "balance": 104540.0,
      "high_water_mark": 104540.0,
      "equity": 100500.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 99313.0
  },
  {
      "date": "2024-08-04",
      "target": 110000.0,
      "balance": 103440.0,
      "high_water_mark": 104540.0,
      "equity": 98900.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 98268.0
  },
  {
      "date": "2024-08-05",
      "target": 110000.0,
      "balance": 104840.0,
      "high_water_mark": 104840.0,
      "equity": 101400.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 99598.0
  },
  {
      "date": "2024-08-06",
      "target": 110000.0,
      "balance": 104940.0,
      "high_water_mark": 104940.0,
      "equity": 100100.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 99693.0
  },
  {
      "date": "2024-08-07",
      "target": 110000.0,
      "balance": 105440.0,
      "high_water_mark": 105440.0,
      "equity": 100500.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100168.0
  },
  {
      "date": "2024-08-08",
      "target": 110000.0,
      "balance": 105340.0,
      "high_water_mark": 105440.0,
      "equity": 99900.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100073.0
  },
  {
      "date": "2024-08-09",
      "target": 110000.0,
      "balance": 105940.0,
      "high_water_mark": 105940.0,
      "equity": 100600.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100643.0
  },
  {
      "date": "2024-08-10",
      "target": 110000.0,
      "balance": 104880.0,
      "high_water_mark": 105940.0,
      "equity": 98940.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 99636.0
  },
  {
      "date": "2024-08-11",
      "target": 110000.0,
      "balance": 106080.0,
      "high_water_mark": 106080.0,
      "equity": 101200.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100776.0
  },
  {
      "date": "2024-08-12",
      "target": 110000.0,
      "balance": 106180.0,
      "high_water_mark": 106180.0,
      "equity": 100100.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100871.0
  },
  {
      "date": "2024-08-13",
      "target": 110000.0,
      "balance": 105780.0,
      "high_water_mark": 106180.0,
      "equity": 99600.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100491.0
  },
  {
      "date": "2024-08-14",
      "target": 110000.0,
      "balance": 106080.0,
      "high_water_mark": 106180.0,
      "equity": 100300.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100776.0
  },
  {
      "date": "2024-08-15",
      "target": 110000.0,
      "balance": 106280.0,
      "high_water_mark": 106280.0,
      "equity": 100200.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100966.0
  },
  {
      "date": "2024-08-16",
      "target": 110000.0,
      "balance": 106180.0,
      "high_water_mark": 106280.0,
      "equity": 99900.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100871.0
  },
  {
      "date": "2024-08-17",
      "target": 110000.0,
      "balance": 106280.0,
      "high_water_mark": 106280.0,
      "equity": 100100.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100966.0
  },
  {
      "date": "2024-08-18",
      "target": 110000.0,
      "balance": 104980.0,
      "high_water_mark": 106280.0,
      "equity": 98700.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 99731.0
  },
  {
      "date": "2024-08-19",
      "target": 110000.0,
      "balance": 105380.0,
      "high_water_mark": 106280.0,
      "equity": 100400.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100111.0
  },
  {
      "date": "2024-08-20",
      "target": 110000.0,
      "balance": 105580.0,
      "high_water_mark": 106280.0,
      "equity": 100200.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100301.0
  },
  {
      "date": "2024-08-21",
      "target": 110000.0,
      "balance": 105980.0,
      "high_water_mark": 106280.0,
      "equity": 100400.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100681.0
  },
  {
      "date": "2024-08-22",
      "target": 110000.0,
      "balance": 105380.0,
      "high_water_mark": 106280.0,
      "equity": 99400.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100111.0
  },
  {
      "date": "2024-08-23",
      "target": 110000.0,
      "balance": 106080.0,
      "high_water_mark": 106280.0,
      "equity": 100700.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100776.0
  },
  {
      "date": "2024-08-24",
      "target": 110000.0,
      "balance": 104880.0,
      "high_water_mark": 106280.0,
      "equity": 98800.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 99636.0
  },
  {
      "date": "2024-08-25",
      "target": 110000.0,
      "balance": 105780.0,
      "high_water_mark": 106280.0,
      "equity": 100900.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100491.0
  },
  {
      "date": "2024-08-26",
      "target": 110000.0,
      "balance": 105980.0,
      "high_water_mark": 106280.0,
      "equity": 100200.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100681.0
  },
  {
      "date": "2024-08-27",
      "target": 110000.0,
      "balance": 106080.0,
      "high_water_mark": 106280.0,
      "equity": 100100.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100776.0
  },
  {
      "date": "2024-08-28",
      "target": 110000.0,
      "balance": 106280.0,
      "high_water_mark": 106280.0,
      "equity": 100200.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100966.0
  },
  {
      "date": "2024-08-29",
      "target": 110000.0,
      "balance": 106280.0,
      "high_water_mark": 106280.0,
      "equity": 100000.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100966.0
  },
  {
      "date": "2024-08-30",
      "target": 110000.0,
      "balance": 106305.0,
      "high_water_mark": 106305.0,
      "equity": 100025.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100989.75
  },
  {
      "date": "2025-02-21",
      "target": 110000.0,
      "balance": 106305.0,
      "high_water_mark": 106305.0,
      "equity": 106305.0,
      "max_drawdown": 90000.0,
      "max_daily_loss": 100989.75
  }

]

export default function MyPage() {
  // Formateador del eje Y
  const yFormatter = (tick) => {
    if (typeof tick === 'number') {
      return `$ ${new Intl.NumberFormat('us').format(tick)}`
    }
    return ''
  }

  return (
    <div >
      <LineChart
        data={data}
        index="date"
        categories={[
          'target',
          'balance',
          //'high_water_mark',
          'equity',
          'max_drawdown',
          'max_daily_loss',
        ]}
        yFormatter={yFormatter}
      />
    </div>
  )
}
