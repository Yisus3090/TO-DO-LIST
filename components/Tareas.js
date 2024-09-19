import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';

const Tareas = ({ text, category, color, onEdit, onDelete, isEditing, onToggleEditing }) => {
  const [editText, setEditText] = useState(text);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [isModalVisible, setModalVisible] = useState(false);

  const handleEdit = () => {
    if (isEditing && editText.trim()) {
      onEdit(editText);
    }
    onToggleEditing();
  };

  const handleDelete = () => {
    // Mostrar el modal de confirmación
    setModalVisible(true);
  };

  const confirmDelete = () => {
    // Ejecutar la animación de eliminación y luego llamar a onDelete
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
      setModalVisible(false); // Cerrar el modal después de eliminar
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

      {/* Modal de confirmación */}
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>¿Estás seguro de que deseas eliminar esta tarea?</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmDelete} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Tareas;
