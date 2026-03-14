package com.coronacion.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.coronacion.dto.CustomerDTO;
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
        customer.setLastServiceDate(customerDTO.getLastServiceDate());
        customer.setNotes(customerDTO.getNotes());

        Customer savedCustomer = customerRepository.save(customer);
        return CustomerDTO.fromEntity(savedCustomer);
    }

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
        Pageable pageable = PageRequest.of(page,size);
        return customerRepository.findAll(pageable);
    }
}
