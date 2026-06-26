package com.itsqmet.actividad_autonoma.controller;

import com.itsqmet.actividad_autonoma.model.Perfil;
import com.itsqmet.actividad_autonoma.service.PerfilService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/perfiles")
@CrossOrigin("*")
public class PerfilController {

    @Autowired
    private PerfilService perfilService;

    @GetMapping
    public ResponseEntity<List<Perfil>> obtenerTodos(){
        List<Perfil> perfiles = perfilService.obtenerTodo();
        return ResponseEntity.ok(perfiles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return perfilService.buscarporId(id)
                .map(perfil -> ResponseEntity.ok((Object) perfil))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Perfil con id " + id + " no encontrado")));
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody Perfil perfil, BindingResult result) {

        if (result.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            result.getFieldErrors().forEach(error ->
                    errores.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errores);
        }

        Perfil nuevo = perfilService.crearPerfil(perfil);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("mensaje", "Perfil creado correctamente", "perfil", nuevo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (perfilService.eliminar(id)) {
            return ResponseEntity.ok(Map.of("mensaje", "Perfil eliminado correctamente")); // 200
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Perfil con id " + id + " no encontrado")); // 404
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Perfil perfil,
            BindingResult result) {

        if (result.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            result.getFieldErrors().forEach(error ->
                    errores.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errores);
        }

        return perfilService.actualizar(id, perfil)
                .map(actualizado -> ResponseEntity.ok(
                        Map.of("mensaje", "Perfil actualizado correctamente", "perfil", actualizado)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Perfil con id " + id + " no encontrada")));
    }

}
