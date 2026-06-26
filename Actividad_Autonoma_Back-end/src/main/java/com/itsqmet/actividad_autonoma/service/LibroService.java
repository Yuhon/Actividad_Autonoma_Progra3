package com.itsqmet.actividad_autonoma.service;

import com.itsqmet.actividad_autonoma.model.Libro;
import com.itsqmet.actividad_autonoma.repository.LibroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LibroService {

    @Autowired
    private LibroRepository libroRepository;

    public List<Libro> obtenerTodo(){
        return libroRepository.findAll();
    }

    public Optional<Libro> buscarporId(Long id){
        return libroRepository.findById(id);
    }

    public Libro crearLibro (Libro libro){
        return libroRepository.save(libro);
    }

    public boolean eliminar(Long id){
        if (libroRepository.existsById(id)){
            libroRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<Libro> actualizar(Long id, Libro libroActualizado){
        return libroRepository.findById(id).map(libro -> {
            libro.setIsbn(libroActualizado.getIsbn());
            libro.setNombre(libroActualizado.getNombre());
            libro.setAutores(libroActualizado.getAutores());
            libro.setCategorias(libroActualizado.getCategorias());
            libro.setPrecio(libroActualizado.getPrecio());
            libro.setStock(libroActualizado.getStock());
            libro.setPerfil(libroActualizado.getPerfil());
            return libroRepository.save(libro);
        });
    }


}
