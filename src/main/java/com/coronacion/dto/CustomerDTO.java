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
    private String lastServiceDate;
    private String notes;

    // Entity -> DTO
    public static CustomerDTO fromEntity(Customer customer) {
        return CustomerDTO.builder()
                .id(customer.getId())
                .name(customer.getName())
                .contactNumber(customer.getContactNumber())
                .address(customer.getAddress())
                .lastServiceDate(
                    customer.getLastServiceDate() != null
                        ? customer.getLastServiceDate().toString()
                        : null
                )
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
        customer.setLastServiceDate(parseDate(this.lastServiceDate));
        customer.setNotes(this.notes);
        return customer;
    }

    // Safely parse "YYYY-MM-DD" string -> LocalDate, returns null for blank/invalid
    public static LocalDate parseDate(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            return LocalDate.parse(raw.trim());
        } catch (Exception e) {
            return null;
        }
    }
}