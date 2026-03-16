package com.coronacion.entity;

import java.time.LocalDate;

import com.coronacion.dto.CustomerDTO;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Data
@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String contactNumber;
    private String address;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(nullable = true)
    private LocalDate lastServiceDate;

    private String notes;

    public void update(CustomerDTO dto){
        this.name            = dto.getName();
        this.contactNumber   = dto.getContactNumber();
        this.address         = dto.getAddress();
        this.lastServiceDate = CustomerDTO.parseDate(dto.getLastServiceDate());
        this.notes           = dto.getNotes();
    }
}