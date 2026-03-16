package com.coronacion.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.coronacion.dto.CustomerDTO;
import com.coronacion.entity.BulkImportResult;
import com.coronacion.entity.Customer;
import com.coronacion.service.CustomerService;

@CrossOrigin(origins = "http://localhost:5500")
@RestController
@RequestMapping("/customer")
public class CustomerController {
    private final CustomerService customerService;

    public CustomerController(CustomerService customerService){
        this.customerService = customerService;
    }

    @PostMapping("/add")
    public ResponseEntity<CustomerDTO> addCustomer(@RequestBody CustomerDTO dto){
        CustomerDTO customer = customerService.addCustomer(dto);
        return ResponseEntity.ok(customer);
    }

    @PostMapping("/bulk-add")
    public ResponseEntity<BulkImportResult> bulkAddCustomers(@RequestBody List<CustomerDTO> dtos){
        BulkImportResult result = customerService.bulkAddCustomers(dtos);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/customers")
    public ResponseEntity<Page<Customer>> getCustomer(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "5") int size
    ){
        Page<Customer> customers = customerService.getCustomers(page, size);
        return ResponseEntity.ok(customers);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<CustomerDTO> updateCustomer(
            @PathVariable Long id,
            @RequestBody CustomerDTO dto) {
        CustomerDTO updated = customerService.updateCustomer(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build(); // 204
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCustomers() {
        customerService.clearCustomers();
        return ResponseEntity.noContent().build();
    }
}
