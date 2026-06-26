package com.itsqmet.actividad_autonoma.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;


@Entity
@Table(name = "perfiles")
public class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El campo nombre no puede estar vacio")
    @Size(min = 4,max = 10,message = "El nombre no cumple con el rango de caracteres de 4 - 10")
    @Column(nullable = false)
    private String nombre;

    @NotBlank(message = "El campo apellido no puede estar vacio")
    @Size(min = 4,max = 15,message = "El apellido no cumple con el rango de caracteres de 4 - 15")
    @Column(nullable = false)
    private String apellido;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene formato válido")
    @Column(unique = true, nullable = false)
    private String email;

    @Pattern(regexp = "\\d{10}", message = "El telefono debe tener 10 dígitos")
    private String telefono;

    @NotBlank(message = "El campo dirección no puede estar vacio")
    private String direccion;


    @OneToOne
    @JoinColumn(name = "libro_id", nullable = false)
    @JsonBackReference("libro-perfil")
    private Libro libro;

    public Perfil() {
    }

    public Perfil(String nombre, String apellido, String email, String telefono, String direccion, Libro libro) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.telefono = telefono;
        this.direccion = direccion;
        this.libro = libro;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public Libro getLibro() {
        return libro;
    }

    public void setLibro(Libro libro) {
        this.libro = libro;
    }
}
