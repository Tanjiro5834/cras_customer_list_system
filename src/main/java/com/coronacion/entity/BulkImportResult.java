package com.coronacion.entity;
import java.util.List;
public class BulkImportResult {
 
    private int saved;
    private int failed;
    private List<String> errors;   // human-readable failure messages
 
    public BulkImportResult() {}
 
    public BulkImportResult(int saved, int failed, List<String> errors) {
        this.saved  = saved;
        this.failed = failed;
        this.errors = errors;
    }
 
    public int getSaved()             { return saved; }
    public void setSaved(int saved)   { this.saved = saved; }
 
    public int getFailed()              { return failed; }
    public void setFailed(int failed)   { this.failed = failed; }
 
    public List<String> getErrors()               { return errors; }
    public void setErrors(List<String> errors)     { this.errors = errors; }
}