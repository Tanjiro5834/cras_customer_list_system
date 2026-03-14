package com.coronacion.dto;

import java.time.LocalDate;
import com.coronacion.entity.Customer;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDTO {

    private Long id;
    private String name;
    private String contactNumber;
    private String address;
    private LocalDate lastServiceDate;
    private String notes;

    // Entity -> DTO
    public static CustomerDTO fromEntity(Customer customer) {
        return CustomerDTO.builder()
                .id(customer.getId())
                .name(customer.getName())
                .contactNumber(customer.getContactNumber())
                .address(customer.getAddress())
                .lastServiceDate(customer.getLastServiceDate())
                .notes(customer.getNotes())
                .build();
    }

    // DTO -> Entity
    public Customer toEntity() {
        Customer customer = new Customer();
        customer.setId(this.id);
        customer.setName(this.name);
        customer.setContactNumber(this.contactNumber);
        customer.setAddress(this.address);
        customer.setLastServiceDate(this.lastServiceDate);
        customer.setNotes(this.notes);
        return customer;
    }
}
