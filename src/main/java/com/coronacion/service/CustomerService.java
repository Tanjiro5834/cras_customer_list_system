package com.coronacion.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.coronacion.dto.CustomerDTO;
import com.coronacion.entity.BulkImportResult;
import com.coronacion.entity.Customer;
import com.coronacion.exception.CustomerNotExistException;
import com.coronacion.repository.CustomerRepository;

import jakarta.transaction.Transactional;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository){
        this.customerRepository = customerRepository;
    }

    public List<Customer> getAllCustomers(){
        return customerRepository.findAll();
    }

    public CustomerDTO addCustomer(CustomerDTO customerDTO){
        Customer customer = new Customer();
        customer.setName(customerDTO.getName());
        customer.setContactNumber(customerDTO.getContactNumber());
        customer.setAddress(customerDTO.getAddress());
        customer.setLastServiceDate(CustomerDTO.parseDate(customerDTO.getLastServiceDate()));
        customer.setNotes(customerDTO.getNotes());

        Customer savedCustomer = customerRepository.save(customer);
        return CustomerDTO.fromEntity(savedCustomer);
    }

    // ── Bulk import ───────────────────────────────────────────────────────────
    // NOTE: NO @Transactional here intentionally — each save() runs in its own
    // auto-transaction so one bad row never rolls back the entire batch.
    public BulkImportResult bulkAddCustomers(List<CustomerDTO> dtos) {
        int saved  = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < dtos.size(); i++) {
            CustomerDTO dto = dtos.get(i);
            try {
                if (dto.getName() == null || dto.getName().isBlank()) {
                    throw new IllegalArgumentException("Name is required");
                }
                Customer customer = new Customer();
                customer.setName(dto.getName().trim());
                customer.setContactNumber(
                    dto.getContactNumber() != null ? dto.getContactNumber().trim() : "");
                customer.setAddress(
                    dto.getAddress() != null ? dto.getAddress().trim() : "");
                // Use sentinel date (1900-01-01) when no date is provided,
                // to satisfy the NOT NULL constraint on the database column.
                LocalDate parsed = CustomerDTO.parseDate(dto.getLastServiceDate());
                customer.setLastServiceDate(parsed != null ? parsed : LocalDate.of(1900, 1, 1));
                customer.setNotes(
                    dto.getNotes() != null ? dto.getNotes().trim() : "");
                customerRepository.save(customer);
                saved++;
            } catch (Exception e) {
                failed++;
                errors.add("Row " + (i + 1) + " ("
                    + (dto.getName() != null ? dto.getName() : "unnamed")
                    + "): " + e.getMessage());
            }
        }
        return new BulkImportResult(saved, failed, errors);
    }
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public CustomerDTO updateCustomer(Long id, CustomerDTO customerDTO){
        Customer customer = customerRepository.findById(id)
        .orElseThrow(() -> new CustomerNotExistException("Customer not found with ID: " + customerDTO.getId()));
        customer.update(customerDTO);
        return CustomerDTO.fromEntity(customer);
    }

    public void deleteCustomer(Long id){
        Customer customer = customerRepository.findById(id)
        .orElseThrow(() -> new CustomerNotExistException("Customer not found with ID: " + id));
        customerRepository.delete(customer);
    }

    public Page<Customer> getCustomers(int page, int size){
        Pageable pageable = PageRequest.of(page, size);
        return customerRepository.findAll(pageable);
    }

    public void clearCustomers() {
        customerRepository.deleteAll();
    }
}