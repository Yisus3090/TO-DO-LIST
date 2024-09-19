import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Keyboard, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';

const categories = [
  { name: 'Personal', color: '#FFDDC1' },
  { name: 'Trabajo', color: '#D1FAE5' },
  { name: 'Estudio', color: '#c1c1c1' }
];

export default function App() {
  const [taskItems, setTaskItems] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [filter, setFilter] = useState('all'); 
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
      });
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        setTaskItems(JSON.parse(savedTasks));
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleAddTask = async () => {
    if (newTask) {
      const newTaskItem = { text: newTask, category: selectedCategory.name, color: selectedCategory.color, completed: false };
      const updatedTasks = [...taskItems, newTaskItem];
      setTaskItems(updatedTasks);
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setNewTask(''); // Solo al agregar una nueva tarea
      Keyboard.dismiss(); // Cierra el teclado
      setModalVisible(false);
    }
  };

  const markTaskCompleted = async (index) => {
    const tasksCopy = [...taskItems];
    tasksCopy[index].completed = !tasksCopy[index].completed;
    setTaskItems(tasksCopy);
    await AsyncStorage.setItem('tasks', JSON.stringify(tasksCopy));
    
    // Alerta de tarea completada
    if (tasksCopy[index].completed) {
      Alert.alert("¡Felicidades!", "Has completado la tarea.");
    }
  };

  const handleEditTask = async (index) => {
    const tasksCopy = [...taskItems];
    tasksCopy[index].text = newTask;
    tasksCopy[index].category = selectedCategory.name;
    tasksCopy[index].color = selectedCategory.color;
    setTaskItems(tasksCopy);
    await AsyncStorage.setItem('tasks', JSON.stringify(tasksCopy));
  
    // Cierra el teclado y el modal después de guardar
    Keyboard.dismiss();
    setModalVisible(false);
    setIsEditing(false);
    setEditIndex(null);
    // No se restablece newTask aquí para evitar que se muestre el modal de agregar
    setNewTask('');
  };

  const openEditModal = (index) => {
    setNewTask(taskItems[index].text);
    setSelectedCategory(categories.find(cat => cat.name === taskItems[index].category));
    setIsEditing(true);
    setEditIndex(index);
    setModalVisible(true);
  };

  const handleDeleteTask = async (index) => {
    Alert.alert(
      "Eliminar Tarea",
      "¿Estás seguro de que deseas eliminar esta tarea?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          onPress: async () => {
            const tasksCopy = taskItems.filter((_, i) => i !== index);
            setTaskItems(tasksCopy);
            await AsyncStorage.setItem('tasks', JSON.stringify(tasksCopy));
          }
        }
      ]
    );
  };

  const filteredTasks = () => {
    switch (filter) {
      case 'completed':
        return taskItems.filter(task => task.completed);
      case 'pending':
        return taskItems.filter(task => !task.completed);
      default:
        return taskItems;
    }
  };

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.titulo}>Tareas Diarias</Text>
        
        <View style={styles.filterButtons}>
          <TouchableOpacity onPress={() => setFilter('all')} style={[styles.filterButton, filter === 'all' && styles.activeFilterButton]}>
            <Text style={[styles.filterButtonText, filter === 'all' && styles.activeFilterButtonText]}>
              Todas ({taskItems.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('pending')} style={[styles.filterButton, filter === 'pending' && styles.activeFilterButton]}>
            <Text style={[styles.filterButtonText, filter === 'pending' && styles.activeFilterButtonText]}>
              Faltan ({taskItems.filter(task => !task.completed).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('completed')} style={[styles.filterButton, filter === 'completed' && styles.activeFilterButton]}>
            <Text style={[styles.filterButtonText, filter === 'completed' && styles.activeFilterButtonText]}>
              Finalizada ({taskItems.filter(task => task.completed).length})
            </Text>
          </TouchableOpacity>
        </View>

        {filteredTasks().map((item, index) => (
          <View key={index} style={[styles.taskItem, { borderWidth: 1, borderColor: "#00000080", backgroundColor: item.color }]}>
            <TouchableOpacity onPress={() => markTaskCompleted(index)} style={styles.taskContent}>
              <Text style={[styles.taskText, item.completed && styles.completedText]}>
                {item.text} ({item.category})
              </Text>
              {item.completed && <Icon name="checkmark-circle" size={20} color="green" />}
            </TouchableOpacity>

            <View style={styles.taskActions}>
              <TouchableOpacity onPress={() => openEditModal(index)}>
                <Icon name="create-outline" size={22} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteTask(index)} style={styles.deleteIcon}>
                <Icon name="trash-outline" size={22} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView style={styles.writeTaskWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Escribe una tarea"
          value={newTask}
          onChangeText={setNewTask}
          placeholderTextColor="#B0B0B0"
        />
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View style={styles.addWrapper}>
            <Text style={styles.addText}>+</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {isKeyboardVisible && (
        <LinearGradient
          colors={['transparent', '#333333']}
          style={styles.keyboardOverlay}
        />
      )}

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Editar Tarea' : 'Selecciona una Categoría'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={35} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.inputModal}
              placeholder="Escribe una tarea"
              value={newTask}
              onChangeText={setNewTask}
              placeholderTextColor="#B0B0B0"
            />

            <ScrollView style={styles.categoryList}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.categoryItem, { backgroundColor: category.color }]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={styles.categoryText}>{category.name}</Text>
                  {selectedCategory.name === category.name && (
                    <Icon name="checkmark" size={20} color="#333" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={isEditing ? () => handleEditTask(editIndex) : handleAddTask}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>{isEditing ? 'Guardar Cambios' : 'Agregar Tarea'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 1,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginTop: 60,
    marginHorizontal: 20,
    fontWeight: '500',
    fontFamily: 'Poppins-Bold'
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', 
    marginVertical: 15,
    paddingHorizontal: 10, 
  },
  filterButton: {
    flex: 1, 
    paddingVertical: 10,
    marginHorizontal: 5, 
    backgroundColor: '#EAEAEA', 
    borderRadius: 16, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08, 
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3, 
  },
  activeFilterButton: {
    backgroundColor: '#333333',
  },
  filterButtonText: {
    color: '#8E8E93', 
    fontWeight: '500', 
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    
  },
  activeFilterButtonText: {
    color: '#ffffff',
    fontFamily: 'Poppins-Regular',
  },
  taskItem: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginLeft: 10,
    marginRight: 10,
    
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteIcon: {
    marginLeft: 10,
  },
  writeTaskWrapper: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginRight: 10,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#333',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    color: '#fff',
    fontSize: 24,
    
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-Bold'
  },
  inputModal: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    color: '#333',
  },
  categoryList: {
    maxHeight: 200, 
    marginBottom: 20,
  },
  categoryItem: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    elevation: 2, 
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-Regular'
  },
  button: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular'
  },
keyboardOverlay: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 200,
  zIndex:-1,
},
saveButton: {
  backgroundColor: '#333',
  borderRadius: 11,
  paddingVertical: 10,
  paddingHorizontal: 20,
        

},
saveButtonText: {
  fontSize: 19,
  color: '#fff',
  fontWeight: '500',
  fontFamily: 'Poppins-Bold',
},
});
