const categories=[
"PDF",
"Images",
"Business",
"Code",
"Video",
"Research",
"Automation"
];


export default function CategoryGrid(){

return(

<div className="categories">

{categories.map(item=>(

<div 
className="category"
key={item}
>
{item}
</div>

))}

</div>

)

}