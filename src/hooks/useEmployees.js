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
      // Defensive: handles both a plain array response AND a
      // { success, data } wrapped response, so a backend response-shape
      // change doesn't silently crash the whole page with
      // ".filter is not a function".
      const list = Array.isArray(data) ? data : data?.data || [];
      setEmployees(list);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function addEmployee(employee) {
    const created = await employeesApi.create(employee);
    const newEmployee = created?.data ?? created;
    setEmployees((prev) => [newEmployee, ...prev]);
    return newEmployee;
  }

  async function updateEmployee(updatedEmployee) {
    const saved = await employeesApi.update(updatedEmployee.id, updatedEmployee);
    const updated = saved?.data ?? saved;
    setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    return updated;
  }

  async function deleteEmployee(id) {
    await employeesApi.remove(id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }

  // Backend already returns a role-scoped list, so this just returns
  // what we have - kept as a function (with an ignored arg) so call
  // sites like getVisibleEmployees(currentUser) keep working.
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