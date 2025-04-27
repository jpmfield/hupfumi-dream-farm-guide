
import React, { useState } from 'react';
import { FarmTask } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from 'lucide-react';

interface TaskTimelineProps {
  tasks: FarmTask[];
}

const TaskTimeline: React.FC<TaskTimelineProps> = ({ tasks }) => {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  
  // Group tasks by timeframe (Week/Month)
  const groupedTasks: Record<string, FarmTask[]> = {};
  
  tasks.forEach(task => {
    if (!groupedTasks[task.timeframe]) {
      groupedTasks[task.timeframe] = [];
    }
    groupedTasks[task.timeframe].push(task);
  });
  
  // Sort timeframe keys
  const sortedTimeframes = Object.keys(groupedTasks).sort((a, b) => {
    // Extract numeric part
    const aMatch = a.match(/(\d+)/);
    const bMatch = b.match(/(\d+)/);
    
    const aNum = aMatch ? parseInt(aMatch[0]) : 0;
    const bNum = bMatch ? parseInt(bMatch[0]) : 0;
    
    // Month is worth 4 weeks
    const aValue = a.startsWith('Month') ? aNum * 4 : aNum;
    const bValue = b.startsWith('Month') ? bNum * 4 : bNum;
    
    return aValue - bValue;
  });
  
  // Create Week and Month based tabs
  const weekTimeframes = sortedTimeframes.filter(tf => tf.startsWith('Week'));
  const monthTimeframes = sortedTimeframes.filter(tf => tf.startsWith('Month'));
  
  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Task Timeline</h3>
      
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">Weekly Tasks</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="mt-4 space-y-4">
          {weekTimeframes.length > 0 ? (
            weekTimeframes.map(timeframe => (
              <div key={timeframe} className="border-b pb-3 last:border-0">
                <h4 className="font-medium text-farm-green-dark mb-2">{timeframe}</h4>
                <ul className="space-y-2">
                  {groupedTasks[timeframe].map(task => (
                    <li 
                      key={task.id}
                      className={`flex items-start p-2 rounded hover:bg-gray-50 ${
                        completedTasks[task.id] ? 'bg-farm-green-light/20' : ''
                      }`}
                    >
                      <div 
                        className={`flex-shrink-0 w-6 h-6 rounded-full border mr-2 flex items-center justify-center cursor-pointer ${
                          completedTasks[task.id] 
                            ? 'bg-farm-green border-farm-green' 
                            : 'border-gray-300'
                        }`}
                        onClick={() => toggleTaskCompletion(task.id)}
                      >
                        {completedTasks[task.id] && <Check className="h-4 w-4 text-white" />}
                      </div>
                      <div>
                        <p className={`font-medium ${completedTasks[task.id] ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        {task.inputs && task.inputs.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs font-medium text-gray-500">Required Inputs:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.inputs.map((input, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-xs bg-gray-100 px-2 py-0.5 rounded"
                                >
                                  {input}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">No weekly tasks available</div>
          )}
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-4 space-y-4">
          {monthTimeframes.length > 0 ? (
            monthTimeframes.map(timeframe => (
              <div key={timeframe} className="border-b pb-3 last:border-0">
                <h4 className="font-medium text-farm-green-dark mb-2">{timeframe}</h4>
                <ul className="space-y-2">
                  {groupedTasks[timeframe].map(task => (
                    <li 
                      key={task.id}
                      className={`flex items-start p-2 rounded hover:bg-gray-50 ${
                        completedTasks[task.id] ? 'bg-farm-green-light/20' : ''
                      }`}
                    >
                      <div 
                        className={`flex-shrink-0 w-6 h-6 rounded-full border mr-2 flex items-center justify-center cursor-pointer ${
                          completedTasks[task.id] 
                            ? 'bg-farm-green border-farm-green' 
                            : 'border-gray-300'
                        }`}
                        onClick={() => toggleTaskCompletion(task.id)}
                      >
                        {completedTasks[task.id] && <Check className="h-4 w-4 text-white" />}
                      </div>
                      <div>
                        <p className={`font-medium ${completedTasks[task.id] ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        {task.inputs && task.inputs.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs font-medium text-gray-500">Required Inputs:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.inputs.map((input, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-xs bg-gray-100 px-2 py-0.5 rounded"
                                >
                                  {input}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">No monthly tasks available</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskTimeline;
