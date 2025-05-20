import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface CardDetailsProps {
  val: number;
}

export default function CardDetails({ val }: CardDetailsProps) {
  const [newsHeadline, setNewsHeadline] = useState<string>('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(
          'https://api.marketaux.com/v1/news/all?symbols=TSLA%2CAMZN%2CMSFT&filter_entities=true&language=en&api_token=IMWTjQ7aFRWiwKxL9aLrbWebcn68Ro63WpfeK9Vz'
        );
        const data = await res.json();
        if (data?.data?.[0]?.title) {
          setNewsHeadline(data.data[0].title);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="mt-6">
      <Card className="w-96 h-90 flex flex-col">
        <CardHeader className="text-left">
          <CardTitle>
            The market is{' '}
            <span className={val >= 0 ? 'text-green-600' : 'text-red-600'}>
              {val >= 0 ? 'bullish' : 'bearish'}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className=" flex-grow">
        </CardContent>

        <CardContent>
        <p className="text-sm text-left">
            What you need to know today:
          </p>
        </CardContent>
        
        <CardFooter className="text-left px-6 pb-4">
          <p className="text-sm font-bold">{newsHeadline || 'Loading headline...'}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
