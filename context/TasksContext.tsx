import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

type TasksCtx = {
  tasks: Task[];
  ready: boolean;
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  resetTasks: () => void;
};

const KEY = 'tasks_v1';

const TasksContext = createContext<TasksCtx | undefined>(undefined);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => {
        if (!raw) return [];
        try {
          const parsed = JSON.parse(raw) as Task[];
          if (Array.isArray(parsed)) {
            return parsed.map(task => ({
              ...task,
              createdAt: task.createdAt ?? new Date().toISOString(),
            }));
          }
          return [];
        } catch {
          return [];
        }
      })
      .then(initial => {
        setTasks(initial ?? []);
      })
      .finally(() => setReady(true));
  }, []);

  const updateTasks = useCallback((updater: (prev: Task[]) => Task[]) => {
    setTasks(prev => {
      const next = updater(prev);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addTask = useCallback(
    (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      updateTasks(prev => [
        {
          id: Date.now().toString(),
          title: trimmed,
          completed: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [updateTasks]
  );

  const toggleTask = useCallback(
    (id: string) => {
      updateTasks(prev =>
        prev.map(task => (task.id === id ? { ...task, completed: !task.completed } : task))
      );
    },
    [updateTasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      updateTasks(prev => prev.filter(task => task.id !== id));
    },
    [updateTasks]
  );

  const resetTasks = useCallback(() => {
    updateTasks(() => []);
  }, [updateTasks]);

  const value = useMemo<TasksCtx>(
    () => ({ tasks, ready, addTask, toggleTask, deleteTask, resetTasks }),
    [tasks, ready, addTask, toggleTask, deleteTask, resetTasks]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within TasksProvider');
  return ctx;
}
