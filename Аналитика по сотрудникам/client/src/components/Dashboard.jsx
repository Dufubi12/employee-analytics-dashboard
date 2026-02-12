import React, { useState, useEffect } from 'react';
import EmployeeCard from './EmployeeCard';

const Dashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/employees')
            .then(res => res.json())
            .then(data => {
                // Add mock rank for now
                const ranked = data.sort((a, b) => a.avg_deviation - b.avg_deviation).map((e, i) => ({ ...e, rank: i + 1 }));
                setEmployees(ranked);
                setLoading(false);
            })
            .catch(err => console.error("Failed to fetch data:", err));
    }, []);

    const handleSelect = (employee) => {
        if (selectedEmployees.find(e => e.name === employee.name)) {
            setSelectedEmployees(prev => prev.filter(e => e.name !== employee.name));
        } else {
            if (selectedEmployees.length < 2) {
                setSelectedEmployees(prev => [...prev, employee]);
            } else {
                // Replace the second one if 2 are already selected
                setSelectedEmployees(prev => [prev[0], employee]);
            }
        }
    };

    if (loading) return <div className="text-center p-10 text-xl animate-pulse">Loading Analytics...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-12 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                        Team Analytics
                    </h1>
                    <p className="text-slate-400">Real-time performance metrics</p>
                </div>
                <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                    <span className="text-sm text-slate-400">Compare Mode: </span>
                    <span className="font-bold text-white ml-2">{selectedEmployees.length} / 2 Selected</span>
                </div>
            </header>

            {/* Comparison View */}
            {selectedEmployees.length > 0 && (
                <div className="mb-12 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Comparison</h2>
                        <button
                            onClick={() => setSelectedEmployees([])}
                            className="text-sm text-red-400 hover:text-red-300"
                        >
                            Clear Selection
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {selectedEmployees.map((emp, idx) => (
                            <div key={idx} className="bg-slate-900 p-6 rounded-xl border border-blue-500/30">
                                <h3 className="text-2xl font-bold mb-4">{emp.name}</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                        <span className="text-slate-400">Avg Deviation</span>
                                        <span className="font-mono text-xl">{emp.avg_deviation} days</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                        <span className="text-slate-400">Tasks Completed</span>
                                        <span className="font-mono text-xl">{emp.total_tasks}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-800 pb-2">
                                        <span className="text-slate-400">Delayed</span>
                                        <span className="font-mono text-xl text-red-400">{emp.delayed}</span>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-sm uppercase text-slate-500 mb-2">Recent Tasks</h4>
                                        <ul className="space-y-2 text-sm">
                                            {emp.tasks.slice(0, 3).map((t, i) => (
                                                <li key={i} className="truncate text-slate-300">• {t['название задачи'] || t.task}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {selectedEmployees.length === 1 && (
                            <div className="flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl text-slate-500">
                                Select another employee to compare
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map(emp => (
                    <div key={emp.name} className={`${selectedEmployees.find(e => e.name === emp.name) ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}>
                        <EmployeeCard
                            employee={emp}
                            onSelect={handleSelect}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
