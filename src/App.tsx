import { useState } from 'react'
import CardDetails from './components/custom/CardDetails';
import StockData from './components/custom/StockData';
import TableData1 from './components/custom/TableData1';
import Navbar from './components/custom/Navbar';


import './App.css'

function App() {
  const [pfValue, setPfValue] = useState<number>(0);

  return (
    <>
      
      <div className='text-left'>
        <Navbar></Navbar>
      </div>

      <div className="flex justify-center gap-4">

    <CardDetails val={pfValue}></CardDetails>
    <StockData pfUpdateValue={setPfValue} ></StockData>

    </div>


    <div className='mt-5'>
    <TableData1></TableData1>
    </div>


    </>
  )
}

export default App
