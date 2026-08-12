import React, { useMemo, useState } from 'react';
import { Download, History, Trash2, ListFilter } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useIPC } from '../hooks/useIPC';
import { DownloadItem } from './DownloadItem';

export const DownloadQueue: React.FC = () => {
  const { downloadQueue } = useAppStore();
  const { clearCompleted } = useIPC();
  const [activeTab, setActiveTab] = useState<'active'|'history'>('active');
  const activeTasks = useMemo(() => downloadQueue.filter(t => t.status !== 'completed'), [downloadQueue]);
  const historyTasks = useMemo(() => downloadQueue.filter(t => t.status === 'completed').sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime()), [downloadQueue]);
  const visible = activeTab === 'active' ? activeTasks : historyTasks;
  return <div className="queue-box">
    <div className="queue-toolbar">
      <div className="queue-tabs">
        <button className={activeTab==='active'?'selected':''} onClick={()=>setActiveTab('active')}><Download/> Active <b>{activeTasks.length}</b></button>
        <button className={activeTab==='history'?'selected':''} onClick={()=>setActiveTab('history')}><History/> History <b>{historyTasks.length}</b></button>
      </div>
      {activeTab==='history' && historyTasks.length>0 && <button className="ghost-danger" onClick={()=>clearCompleted()}><Trash2/> Clear history</button>}
    </div>
    {visible.length===0 ? <div className="queue-empty"><ListFilter/><div><strong>{activeTab==='active'?'Nothing downloading yet':'No completed downloads yet'}</strong><span>Your downloads will appear here with progress, speed and status.</span></div></div> : <div className="queue-list">{visible.map(task=><DownloadItem key={task.id} task={task}/>)}</div>}
  </div>;
};
