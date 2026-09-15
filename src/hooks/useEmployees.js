import { useCallback, useEffect, useState } from "react";

import { employeesApi } from "../api/Employeeapi";
import { ROLES } from "../utils/roles";

export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await employeesApi.list();
      setEmployees(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function addEmployee(employee) {
    const created = await employeesApi.create(employee);
    setEmployees((prev) => [created, ...prev]);
    return created;
  }

  async function updateEmployee(updatedEmployee) {
    const saved = await employeesApi.update(updatedEmployee.id, updatedEmployee);
    setEmployees((prev) => prev.map((e) => (e.id === saved.id ? saved : e)));
    return saved;
  }

  async function deleteEmployee(id) {
    await employeesApi.remove(id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }

  // Backend already returns a role-scoped list (see
  // employeeController.listEmployees), so this just returns what we have.
  function getVisibleEmployees() {
    return employees;
  }

  function getManagers() {
    return employees.filter((e) => e.role === ROLES.MANAGER);
  }

  function getEmployeeName(id) {
    return employees.find((e) => e.id === id)?.name || "";
  }

  return {
    employees,
    isLoading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getVisibleEmployees,
    getManagers,
    getEmployeeName,
    refetch,
  };
}