package com.itsqmet.actividad_autonoma.repository;

import com.itsqmet.actividad_autonoma.model.Libro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LibroRepository extends JpaRepository<Libro, Long> {
}
