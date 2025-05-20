import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';

interface SectorData {
  sector: string;
  changesPercentage: string;
}

interface StockDataProps {
  
  pfUpdateValue?: (val: number) => void;
}

export default function StockData({ pfUpdateValue }: StockDataProps) {
  const [data, setData] = useState<SectorData[]>([]);

  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        const res = await fetch(
          'https://financialmodelingprep.com/api/v3/sector-performance?apikey=m04c81y0cbnaeKsvS7xNUIOCqpyZ27hw'
        );
        const rawData = await res.json();

        const numberArray = rawData.map((item: any) =>
          parseFloat(item.changesPercentage.replace('%', ''))
        );

        const average =
          numberArray.reduce((acc:any, curr:any) => acc + curr, 0) /
          numberArray.length;

        
        pfUpdateValue?.(average);

        const allSectors: SectorData = {
          sector: 'All Sectors',
          changesPercentage: `${average.toFixed(2)}%`,
        };

        setData([allSectors, ...rawData]);
      } catch (err) {
        console.error('Error fetching sector performance:', err);
      }
    };

    fetchSectorData();
  }, [pfUpdateValue]);

  const renderChange = (change: string) => {
    const val = parseFloat(change);
    const color = val < 0 ? 'text-red-600' : 'text-green-600';
    const sign = val > 0 ? '+' : '';
    return <span className={`${color} font-bold`}>{sign}{change}</span>;
  };

  return (
    <div className="mt-6 flex ">
      <Card className="w-200 max-w-4xl flex flex-col ">
        <CardHeader className="px-6 pb-2 text-left">
          <CardTitle className="text-base font-semibold">
            Sector Performance
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 pt-0">
          <Table>
            <TableBody>
              {Array.from({ length: Math.ceil(data.length / 2) }).map((_, i) => {
                const first = data[i * 2];
                const second = data[i * 2 + 1];

                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      {first?.sector}
                    </TableCell>
                    <TableCell>
                      {first && renderChange(first.changesPercentage)}
                    </TableCell>

                    {second ? (
                      <>
                        <TableCell className="font-medium">
                          {second.sector}
                        </TableCell>
                        <TableCell>
                          {renderChange(second.changesPercentage)}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell />
                        <TableCell />
                      </>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
