package com.itsqmet.actividad_autonoma.service;

import com.itsqmet.actividad_autonoma.model.Perfil;
import com.itsqmet.actividad_autonoma.repository.PerfilRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PerfilService {

    @Autowired
    private PerfilRepository perfilRepository;

    public List<Perfil> obtenerTodo(){
        return perfilRepository.findAll();
    }

    public Optional<Perfil> buscarporId(Long id){
      return perfilRepository.findById(id);
    }

    public Perfil crearPerfil (Perfil perfil) {
        return perfilRepository.save(perfil);
    }

    public boolean eliminar(Long id){
        if (perfilRepository.existsById(id)){
            perfilRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<Perfil> actualizar(Long id, Perfil perfilActualizado){
        return perfilRepository.findById(id).map(perfil -> {
            perfil.setNombre(perfilActualizado.getNombre());
            perfil.setApellido(perfilActualizado.getApellido());
            perfil.setEmail(perfilActualizado.getEmail());
            perfil.setTelefono(perfilActualizado.getTelefono());
            perfil.setDireccion(perfilActualizado.getDireccion());
            perfil.setLibro(perfilActualizado.getLibro());
            return perfilRepository.save(perfil);
        });
    }

}
