import { useEffect, useState } from 'react'

function ResultsPage() {
  const [example, setExample] = useState([{
    "major": "Computer Science B.S",
    "courses": ["001","002","003"]
},
{
    "major": "Computer Science B.A",
    "courses": ["001","002","003"]
},
{
    "major": "Accounting B.S.B",
    "courses": ["011","022","003"]
},
{
    "major": "Biology B.A",
    "courses": ["021","022","023"]
}
])
return (
  <div> 
    <h1>Results/Analysis Page</h1>
  </div>
)
}


export default ResultsPage