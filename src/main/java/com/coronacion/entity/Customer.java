package com.coronacion.entity;

import java.time.LocalDate;

import com.coronacion.dto.CustomerDTO;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    private String contactNumber;

    @NotBlank
    private String address;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @NotNull
    private LocalDate lastServiceDate;

    @NotBlank
    private String notes;

    public void update(CustomerDTO dto){
        this.name = dto.getName();
        this.contactNumber = dto.getContactNumber();
        this.contactNumber = dto.getContactNumber();
        this.address = dto.getAddress();
        this.notes = dto.getNotes();
    }
}
