import React from 'react'
import { useState } from 'react'

function SelectOptions({context, items}) {
                                                // pra pina kauna sa array ipakita lol
    const [selected, setSelected] = useState(items.length > 0 ? items[0].id : '');
    return (
        <div className='flex flex-row gap-2 items-center'>
            <span className='text-gray-600 font-semibold'>{context}:</span>
            <select className='w-30 border-gray-200 bg-white border rounded-sm py-0.5 px-3 shadow-sm cursor-pointer'
                    value={selected} onChange={(e) => setSelected(e.target.value)}>
                {items.map((item) => (
                    <option className=' '
                            key={item.id} 
                            value={item.id}>
                        {item.name}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default SelectOptions