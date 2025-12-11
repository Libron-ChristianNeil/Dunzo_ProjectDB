import React from 'react';

// Added onValueChange prop to communicate with parent
function SelectOptions({ context, items, onValueChange }) { 
    return (
        <div className='flex flex-row gap-2 items-center'>
            <span className='text-gray-600 font-semibold'>{context}:</span>
            <select 
                className='w-30 border-gray-200 bg-white border rounded-sm py-0.5 px-3 shadow-sm cursor-pointer'
                // When changed, call the parent's function
                onChange={(e) => onValueChange(e.target.value)} 
            >
                <option value="all">All</option>
                {items.map((item) => (
                    <option 
                        className=''
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