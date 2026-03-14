package com.coronacion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.coronacion.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long>{
    
}
