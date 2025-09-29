import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Check, X } from 'lucide-react-native';
import { s, vs, ms } from '@/lib/responsive';
import { t, resolveLang } from '@/lib/i18n';
import { usePrefs } from '@/context/PrefsContext';
import { useTasks, Task } from '@/context/TasksContext';
import { useTheme } from '@/context/ThemeContext';
const FONT_REGULAR = 'Poppins-Regular';
const FONT_MEDIUM = 'Poppins-Medium';
const FONT_SEMIBOLD = 'Poppins-SemiBold';
const FONT_BOLD = 'Poppins-Bold';

export default function TasksScreen() {
  const { prefs } = usePrefs();
  const uiLang = resolveLang(prefs.language);
  const { theme } = useTheme();
  const palette = theme.colors;
  const { tasks, addTask: addTaskToStore, toggleTask: toggleTaskInStore, deleteTask: deleteTaskFromStore } = useTasks();
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const addTask = () => {
    if (newTaskText.trim()) {
      addTaskToStore(newTaskText);
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  const toggleTask = (id: string) => {
    toggleTaskInStore(id);
  };

  const deleteTask = (id: string) => {
    deleteTaskFromStore(id);
  };

  const completedCount = tasks.filter(task => task.completed).length;

  const renderTask = ({ item }: { item: Task }) => (
    <View style={[styles.taskItem, item.completed && styles.completedTask]}>
      <TouchableOpacity
        style={[styles.checkbox, item.completed && styles.checkedBox]}
        onPress={() => toggleTask(item.id)}
      >
        {item.completed && <Check size={ms(14)} color="#000011" strokeWidth={3} />}
      </TouchableOpacity>
      
      <Text style={[styles.taskText, item.completed && styles.completedText]}>
        {item.title}
      </Text>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTask(item.id)}
      >
        <X size={ms(18)} color="#FF0066" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={theme.gradient} style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.gridOverlay} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.primary }]}>{t('tasks.title', uiLang)}</Text>
        <View style={styles.statsContainer}>
          <Text style={[styles.statText, { color: palette.text }]}>
            {t('tasks.completed', uiLang)}: <Text style={[styles.statNumber, { color: palette.accent }]}>{completedCount}</Text>
          </Text>
          <Text style={[styles.statText, { color: palette.text }]}>
            {t('tasks.total', uiLang)}: <Text style={[styles.statNumber, { color: palette.accent }]}>{tasks.length}</Text>
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
              placeholder={t('tasks.placeholder', uiLang)}
              placeholderTextColor="#666699"
              autoFocus
              multiline
              maxLength={100}
            />
            <View style={styles.addTaskButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={addTask}>
                <Check size={ms(20)} color="#00FFFF" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => {
                  setIsAddingTask(false);
                  setNewTaskText('');
                }}
              >
                <X size={ms(20)} color="#FF0066" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addButton, { borderColor: palette.primary, backgroundColor: 'rgba(0,255,255,0.1)' }]}
            onPress={() => setIsAddingTask(true)}
          >
            <Plus size={ms(20)} color={palette.primary} strokeWidth={2} />
            <Text style={[styles.addButtonText, { color: palette.primary }]}>{t('tasks.addNew', uiLang)}</Text>
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
    paddingTop: vs(48),
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    alignItems: 'center',
    paddingVertical: vs(16),
    paddingHorizontal: s(16),
  },
  title: {
    fontFamily: FONT_BOLD,
    fontSize: ms(24),
    color: '#00FFFF',
    letterSpacing: 2,
    textShadowColor: 'transparent',
    textShadowRadius: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: s(16),
    marginTop: vs(10),
  },
  statText: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: ms(12),
    color: '#666699',
    letterSpacing: 0.5,
  },
  statNumber: {
    color: '#FFFF00',
    fontFamily: FONT_BOLD,
  },
  content: {
    flex: 1,
    paddingHorizontal: s(16),
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: s(12),
    backgroundColor: 'rgba(0,255,255,0.1)',
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 8,
    marginBottom: vs(12),
    gap: s(8),
  },
  addButtonText: {
    fontFamily: FONT_BOLD,
    fontSize: ms(14),
    color: '#00FFFF',
    letterSpacing: 1,
  },
  addTaskContainer: {
    backgroundColor: 'rgba(255,0,255,0.1)',
    borderWidth: 2,
    borderColor: '#FF00FF',
    borderRadius: 8,
    padding: s(12),
    marginBottom: vs(12),
  },
  taskInput: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: ms(14),
    color: '#FFFFFF',
    minHeight: vs(60),
    textAlignVertical: 'top',
  },
  addTaskButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: s(8),
    marginTop: vs(8),
  },
  actionButton: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingBottom: vs(80),
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(12),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: '#333366',
    borderRadius: 8,
    marginBottom: vs(10),
  },
  completedTask: {
    borderColor: '#00FF66',
    backgroundColor: 'rgba(0,255,102,0.1)',
  },
  checkbox: {
    width: ms(22),
    height: ms(22),
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(10),
  },
  checkedBox: {
    backgroundColor: '#00FFFF',
  },
  taskText: {
    flex: 1,
    fontFamily: FONT_SEMIBOLD,
    fontSize: ms(14),
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  completedText: {
    color: '#00FF66',
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: s(4),
  },
});

