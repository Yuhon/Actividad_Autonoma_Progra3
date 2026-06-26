package com.itsqmet.actividad_autonoma.repository;

import com.itsqmet.actividad_autonoma.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}
