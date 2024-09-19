import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Tareas = ({ text, category, color, onEdit, onDelete, isEditing, onToggleEditing }) => {
  const [editText, setEditText] = useState(text);
  const [fadeAnim] = useState(new Animated.Value(1)); // Animación de desaparición

  const handleEdit = () => {
    if (isEditing && editText.trim()) {
      onEdit(editText); // Editar la tarea
    }
    onToggleEditing(); // Alternar entre edición y visualización
  };

  const handleDelete = () => {
    // Alerta de confirmación antes de eliminar la tarea
    Alert.alert(
      'Eliminar tarea', // Título
      '¿Estás seguro de que deseas eliminar esta tarea?', // Mensaje
      [
        { text: 'Cancelar', style: 'cancel' }, // Botón de cancelar
        { 
          text: 'Eliminar', 
          onPress: () => confirmDelete() // Solo eliminar si el usuario lo confirma
        },
      ],
      { cancelable: true }
    );
  };

  const confirmDelete = () => {
    // Animación de eliminación antes de eliminar la tarea
    Animated.timing(fadeAnim, {
      toValue: 0, // Reducir la opacidad a 0
      duration: 300, // Duración de la animación
      useNativeDriver: true,
    }).start(() => {
      onDelete(); // Llamar a la función onDelete una vez que se complete la animación
    });
  };

  return (
    <Animated.View style={[styles.item, { opacity: fadeAnim }]}>
      <View style={[styles.categoryIndicator, { backgroundColor: color }]}></View>
      <View style={styles.itemIzquierdo}>
        {isEditing ? (
          <TextInput
            style={styles.itemText}
            value={editText}
            onChangeText={setEditText}
            onSubmitEditing={handleEdit}
            autoFocus
          />
        ) : (
          <Text style={styles.itemText}>{text}</Text>
        )}
        {!isEditing && <Text style={styles.categoryText}>{category}</Text>}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleEdit}>
          <Icon name={isEditing ? "checkmark-outline" : "pencil-outline"} size={20} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Icon name="trash-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  categoryIndicator: {
    width: 10,
    height: 30,
    borderRadius: 5,
    marginRight: 10,
  },
  itemText: {
    color: '#333',
    fontSize: 16,
    marginLeft: 10,
    maxWidth: '60%',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 15,
  },
});

export default Tareas;
