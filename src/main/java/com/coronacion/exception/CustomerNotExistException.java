package com.coronacion.exception;

public class CustomerNotExistException extends RuntimeException{
    public CustomerNotExistException(Long id) {
        super("Customer with ID " + id + " does not exist.");
    }

    public CustomerNotExistException(String message) {
        super(message);
    }
}
