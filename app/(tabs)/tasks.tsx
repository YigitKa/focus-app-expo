import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Check, X } from 'lucide-react-native';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskText.trim(),
        completed: false,
        createdAt: new Date(),
      };
      setTasks(prev => [newTask, ...prev]);
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const completedCount = tasks.filter(task => task.completed).length;

  const renderTask = ({ item }: { item: Task }) => (
    <View style={[styles.taskItem, item.completed && styles.completedTask]}>
      <TouchableOpacity
        style={[styles.checkbox, item.completed && styles.checkedBox]}
        onPress={() => toggleTask(item.id)}
      >
        {item.completed && <Check size={16} color="#000011" strokeWidth={3} />}
      </TouchableOpacity>
      
      <Text style={[styles.taskText, item.completed && styles.completedText]}>
        {item.title}
      </Text>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTask(item.id)}
      >
        <X size={20} color="#FF0066" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#000011', '#001122', '#000033']} style={styles.container}>
      <View style={styles.gridOverlay} />
      
      <View style={styles.header}>
        <Text style={styles.title}>TASK QUEUE</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>
            COMPLETED: <Text style={styles.statNumber}>{completedCount}</Text>
          </Text>
          <Text style={styles.statText}>
            TOTAL: <Text style={styles.statNumber}>{tasks.length}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {isAddingTask ? (
          <View style={styles.addTaskContainer}>
            <TextInput
              style={styles.taskInput}
              value={newTaskText}
              onChangeText={setNewTaskText}
              placeholder="ENTER TASK NAME..."
              placeholderTextColor="#666699"
              autoFocus
              multiline
              maxLength={100}
            />
            <View style={styles.addTaskButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={addTask}>
                <Check size={24} color="#00FFFF" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => {
                  setIsAddingTask(false);
                  setNewTaskText('');
                }}
              >
                <X size={24} color="#FF0066" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddingTask(true)}
          >
            <Plus size={24} color="#00FFFF" strokeWidth={2} />
            <Text style={styles.addButtonText}>ADD NEW TASK</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          style={styles.taskList}
          contentContainerStyle={styles.taskListContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)',
    backgroundSize: '15px 15px',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'Courier New',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00FFFF',
    letterSpacing: 3,
    textShadowColor: '#00FFFF',
    textShadowRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 15,
  },
  statText: {
    fontFamily: 'Courier New',
    fontSize: 14,
    color: '#666699',
    letterSpacing: 1,
  },
  statNumber: {
    color: '#FFFF00',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,255,255,0.1)',
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 8,
    marginBottom: 20,
    gap: 10,
  },
  addButtonText: {
    fontFamily: 'Courier New',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00FFFF',
    letterSpacing: 1,
  },
  addTaskContainer: {
    backgroundColor: 'rgba(255,0,255,0.1)',
    borderWidth: 2,
    borderColor: '#FF00FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  taskInput: {
    fontFamily: 'Courier New',
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addTaskButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingBottom: 100,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: '#333366',
    borderRadius: 8,
    marginBottom: 12,
  },
  completedTask: {
    borderColor: '#00FF66',
    backgroundColor: 'rgba(0,255,102,0.1)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkedBox: {
    backgroundColor: '#00FFFF',
  },
  taskText: {
    flex: 1,
    fontFamily: 'Courier New',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  completedText: {
    color: '#00FF66',
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: 4,
  },
});