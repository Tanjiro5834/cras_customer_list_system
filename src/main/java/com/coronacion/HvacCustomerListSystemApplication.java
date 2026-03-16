package com.coronacion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HvacCustomerListSystemApplication {
	public static void main(String[] args) {
		new java.io.File(System.getProperty("user.home") + "/CoronacionApp").mkdirs();
		SpringApplication.run(HvacCustomerListSystemApplication.class, args);
	}
}
