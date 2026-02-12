import React from 'react';

const EmployeeCard = ({ employee, onSelect }) => {
    return (
        <div
            className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 hover:border-blue-500 transition-all cursor-pointer group"
            onClick={() => onSelect(employee)}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold group-hover:text-blue-400 text-white">{employee.name}</h3>
                <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-400">
                    Rank #{employee.rank || '-'}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900/50 p-3 rounded-lg">
                    <p className="text-slate-400 text-xs uppercase mb-1">Total Tasks</p>
                    <p className="text-2xl font-bold text-white">{employee.total_tasks}</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg">
                    <p className="text-slate-400 text-xs uppercase mb-1">Avg Deviation</p>
                    <p className={`text-2xl font-bold ${employee.avg_deviation > 5 ? 'text-red-400' : 'text-green-400'}`}>
                        {employee.avg_deviation}d
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Delayed</span>
                    <span className="text-red-400 font-medium">{employee.delayed}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Postponed</span>
                    <span className="text-yellow-400 font-medium">{employee.postponed}</span>
                </div>
            </div>
        </div>
    );
};

export default EmployeeCard;
