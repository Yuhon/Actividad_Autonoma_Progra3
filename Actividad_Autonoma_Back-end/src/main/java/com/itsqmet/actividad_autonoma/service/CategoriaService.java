package com.itsqmet.actividad_autonoma.service;

import com.itsqmet.actividad_autonoma.model.Categoria;
import com.itsqmet.actividad_autonoma.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    public List<Categoria> obtenerTodo(){
        return categoriaRepository.findAll();
    }

    public Optional<Categoria> buscarporId(Long id){
        return categoriaRepository.findById(id);
    }

    public Categoria crearCategoria (Categoria categoria){
        return categoriaRepository.save(categoria);
    }

    public boolean eliminar(Long id){
        if (categoriaRepository.existsById(id)){
            categoriaRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<Categoria> actualizar(Long id, Categoria categoriaActualizado){
        return categoriaRepository.findById(id).map(categoria -> {
            categoria.setNombre(categoriaActualizado.getNombre());
            categoria.setDescripcion(categoriaActualizado.getDescripcion());
            categoria.setLibros(categoriaActualizado.getLibros());
            return categoriaRepository.save(categoria);
        });
    }


}
