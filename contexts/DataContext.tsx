
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MonthlyData, Employee, SalaryRecord, SystemUser, GlobalSettings, Workshop } from '../types';
import { db } from '../services/db';
import { getWorkingDays } from '../services/calcService';

interface DataContextType {
  currentDate: { year: number; month: number };
  setCurrentDate: (date: { year: number; month: number }) => void;
  currentData: MonthlyData;
  employees: Employee[];
  workshops: Workshop[];
  systemUsers: SystemUser[];
  settings: GlobalSettings;
  isLoading: boolean;
  isSaving: boolean;
  updateParams: (params: Partial<MonthlyData['params']>) => void;
  updateRecord: (employeeId: string, changes: Partial<SalaryRecord>) => void;
  updateDailyLog: (employeeId: string, day: number, hours: number) => void;
  clearAllAttendance: () => Promise<void>;
  autoFillAttendance: () => Promise<void>;

  // Employee
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (emp: Employee) => Promise<void>;
  removeEmployee: (id: string) => Promise<void>;
  resetMonthData: () => Promise<void>;

  // Workshops
  addWorkshopFolder: (workshopId: string, folderName: string) => Promise<void>;
  addWorkshop: (name: string, code: string) => Promise<void>;
  deleteWorkshop: (id: string) => Promise<void>;
  deleteWorkshopFolder: (workshopId: string, folderName: string) => Promise<void>;

  // User Management
  addSystemUser: (user: Omit<SystemUser, 'id'>) => Promise<void>;
  updateSystemUser: (user: SystemUser) => Promise<void>;
  deleteSystemUser: (id: string) => Promise<void>;

  // Settings
  updateSettings: (settings: Partial<GlobalSettings>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_PARAMS = {
  area: 18000,
  unitPrice: 2.5,
  attendancePack: 20000,
  kpiScore: 2500,
  weightTime: 50,
  weightBase: 50
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });

  const [currentData, setCurrentData] = useState<MonthlyData | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>({ announcement: '' });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    const loadBasics = async () => {
      try {
        await db.connect();
        const emps = await db.getEmployees();
        const users = await db.getSystemUsers();
        const sets = await db.getSettings();
        const ws = await db.getWorkshops();
        setEmployees(emps);
        setSystemUsers(users);
        setSettings(sets);
        setWorkshops(ws);
      } catch (err) {
        console.error("Failed to load basic data:", err);
      }
    };
    loadBasics();
  }, []);

  // 2. Load Monthly Data
  useEffect(() => {
    let isMounted = true;
    const loadMonth = async () => {
      if (employees.length === 0 && !currentData) {
        if (employees.length === 0 && isLoading) return;
      }

      setIsLoading(true);
      const year = currentDate.year;
      const month = currentDate.month;

      try {
        const existingData = await db.getMonthlyData(year, month);

        if (isMounted) {
          const workingDays = getWorkingDays(year, month);

          if (existingData) {
            // Sync new employees into existing month
            const existingIds = new Set(existingData.records.map(r => r.employeeId));
            // Filter out Weaving employees (ws_weaving) as they have their own calculation module
            const activeEmps = employees.filter(e => e.status !== 'terminated' && e.workshopId !== 'ws_weaving');

            const newRecords = activeEmps
              .filter(e => !existingIds.has(e.id))
              .map(e => {
                const dailyTarget = e.expectedDailyHours || 12;
                return {
                  employeeId: e.id,
                  employeeName: e.name,
                  workHours: workingDays * dailyTarget,
                  expectedHours: workingDays * dailyTarget,
                  baseScoreSnapshot: e.standardBaseScore,
                  dailyLogs: {}
                };
              });

            // Sync names and filter out Weaving employees AND terminated employees from existing records
            const updatedRecords = existingData.records
              .map(r => {
                const emp = employees.find(e => e.id === r.employeeId);
                return emp ? { ...r, employeeName: emp.name } : r;
              })
              .filter(r => {
                const emp = employees.find(e => e.id === r.employeeId);
                // Filter out if employee not found, or is weaving, or is terminated
                return emp && emp.workshopId !== 'ws_weaving' && emp.status !== 'terminated';
              });

            const mergedData = {
              ...existingData,
              records: [...updatedRecords, ...newRecords]
            };

            setCurrentData(mergedData);
            // Always save if we filtered out records or added new ones to ensure DB consistency
            if (newRecords.length > 0 || updatedRecords.length !== existingData.records.length) {
              db.saveMonthlyData(mergedData);
            }
          } else {
            // Create new
            // Filter out Weaving employees (ws_weaving)
            const activeEmps = employees.filter(e => e.status !== 'terminated' && e.workshopId !== 'ws_weaving');
            const newData: MonthlyData = {
              id: `${year}-${String(month).padStart(2, '0')}`,
              params: { ...DEFAULT_PARAMS, year, month },
              records: activeEmps.map(e => {
                const dailyTarget = e.expectedDailyHours || 12;
                return {
                  employeeId: e.id,
                  employeeName: e.name,
                  workHours: workingDays * dailyTarget,
                  expectedHours: workingDays * dailyTarget,
                  baseScoreSnapshot: e.standardBaseScore,
                  dailyLogs: {}
                };
              })
            };
            setCurrentData(newData);
            db.saveMonthlyData(newData);
          }
        }
      } catch (err) {
        console.error("Error loading monthly data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMonth();
    return () => { isMounted = false; };
  }, [currentDate, employees]);

  const persistData = async (newData: MonthlyData) => {
    setCurrentData(newData);
    setIsSaving(true);
    try {
      await db.saveMonthlyData(newData);
    } finally {
      setIsSaving(false);
    }
  };

  const updateParams = (changes: Partial<MonthlyData['params']>) => {
    if (!currentData) return;
    persistData({
      ...currentData,
      params: { ...currentData.params, ...changes }
    });
  };

  const updateRecord = (employeeId: string, changes: Partial<SalaryRecord>) => {
    if (!currentData) return;
    persistData({
      ...currentData,
      records: currentData.records.map(r =>
        r.employeeId === employeeId ? { ...r, ...changes } : r
      )
    });
  };

  const updateDailyLog = (employeeId: string, day: number, hours: number) => {
    if (!currentData) return;
    const record = currentData.records.find(r => r.employeeId === employeeId);
    if (!record) return;

    const newLogs = { ...(record.dailyLogs || {}), [day]: hours };
    const totalHours = (Object.values(newLogs) as number[]).reduce((acc, curr) => acc + (curr || 0), 0);

    persistData({
      ...currentData,
      records: currentData.records.map(r =>
        r.employeeId === employeeId
          ? { ...r, dailyLogs: newLogs, workHours: totalHours }
          : r
      )
    });
  };

  const clearAllAttendance = async () => {
    if (!currentData) return;
    setIsSaving(true);

    const daysInMonth = new Date(currentData.params.year, currentData.params.month, 0).getDate();

    const updatedRecords = currentData.records.map(record => {
      const newLogs: Record<number, number> = {};
      for (let d = 1; d <= daysInMonth; d++) {
        newLogs[d] = 0;
      }
      return {
        ...record,
        dailyLogs: newLogs,
        workHours: 0
      };
    });

    const newData = {
      ...currentData,
      records: updatedRecords
    };

    await persistData(newData);
  };

  const autoFillAttendance = async () => {
    if (!currentData) return;
    setIsSaving(true);

    const year = currentDate.year;
    const month = currentDate.month;
    const daysInMonth = new Date(year, month, 0).getDate();
    const workingDays = getWorkingDays(year, month);

    const empConfigMap = new Map<string, number>(
      employees.map(e => [e.id, e.expectedDailyHours || 12] as [string, number])
    );

    const updatedRecords = currentData.records.map(record => {
      const dailyTarget = empConfigMap.get(record.employeeId) || 12;
      const newLogs: Record<number, number> = {};
      let sumWork = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        if (date.getDay() !== 0) {
          newLogs[d] = dailyTarget;
          sumWork += dailyTarget;
        } else {
          newLogs[d] = 0;
        }
      }

      const expected = workingDays * dailyTarget;

      return {
        ...record,
        dailyLogs: newLogs,
        workHours: sumWork,
        expectedHours: expected
      };
    });

    await persistData({ ...currentData, records: updatedRecords });
    setIsSaving(false);
  };

  // === Workshops & Folders ===
  const addWorkshopFolder = async (workshopId: string, folderName: string) => {
    const targetWs = workshops.find(w => w.id === workshopId);
    if (!targetWs || targetWs.departments.includes(folderName)) return;

    const updatedWs = { ...targetWs, departments: [...targetWs.departments, folderName] };
    const newWorkshops = workshops.map(w => w.id === workshopId ? updatedWs : w);

    setWorkshops(newWorkshops);
    setIsSaving(true);
    await db.saveWorkshops(newWorkshops);
    setIsSaving(false);
  };

  const deleteWorkshopFolder = async (workshopId: string, folderName: string) => {
    const targetWs = workshops.find(w => w.id === workshopId);
    if (!targetWs) return;
    if (!targetWs.departments.includes(folderName)) return;

    const updatedWs = { ...targetWs, departments: targetWs.departments.filter(d => d !== folderName) };
    const newWorkshops = workshops.map(w => w.id === workshopId ? updatedWs : w);

    setWorkshops(newWorkshops);
    setIsSaving(true);
    await db.saveWorkshops(newWorkshops);
    setIsSaving(false);
  };

  const addWorkshop = async (name: string, code: string) => {
    const newWs: Workshop = { id: generateId(), name, code, departments: [] };
    const newWorkshops = [...workshops, newWs];
    setWorkshops(newWorkshops);
    setIsSaving(true);
    await db.saveWorkshops(newWorkshops);
    setIsSaving(false);
  };

  const deleteWorkshop = async (id: string) => {
    const newWorkshops = workshops.filter(w => w.id !== id);
    setWorkshops(newWorkshops);
    setIsSaving(true);
    await db.saveWorkshops(newWorkshops);
    setIsSaving(false);
  };

  // === Employee CRUD ===
  const addEmployee = async (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = { ...empData, id: generateId() };
    setIsSaving(true);
    try {
      const saved = await db.createEmployee(newEmp);
      setEmployees(prev => [...prev, saved]);
    } finally {
      setIsSaving(false);
    }
  };

  const updateEmployee = async (updatedEmp: Employee) => {
    const newEmps = employees.map(e => e.id === updatedEmp.id ? updatedEmp : e);
    setEmployees(newEmps);
    setIsSaving(true);
    await db.updateEmployee(updatedEmp);

    if (currentData) {
      const newData = {
        ...currentData,
        records: currentData.records.map(r =>
          r.employeeId === updatedEmp.id
            ? { ...r, baseScoreSnapshot: updatedEmp.standardBaseScore, employeeName: updatedEmp.name }
            : r
        )
      };
      await persistData(newData);
    }
    setIsSaving(false);
  };

  const deleteEmployee = async (id: string) => {
    const newEmps = employees.filter(e => e.id !== id);
    setEmployees(newEmps);
    setIsSaving(true);
    
    // 从月度数据中删除该员工的记录
    if (currentData) {
      const newData = {
        ...currentData,
        records: currentData.records.filter(r => r.employeeId !== id)
      };
      await persistData(newData);
    }
    
    // 从数据库中删除员工
    await db.deleteEmployee(id);
    setIsSaving(false);
  };

  const removeEmployee = async (id: string) => {
    const target = employees.find(e => e.id === id);
    if (!target) return;
    const updatedEmp = { ...target, status: 'terminated' as const };
    await updateEmployee(updatedEmp);
  };

  // === System User CRUD ===
  const addSystemUser = async (user: Omit<SystemUser, 'id'>) => {
    setIsSaving(true);
    try {
      const created = await db.createSystemUser({ ...user, id: generateId() });
      setSystemUsers(prev => [...prev, created]);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSystemUser = async (user: SystemUser) => {
    setIsSaving(true);
    try {
      const updated = await db.updateSystemUserRemote(user);
      setSystemUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSystemUser = async (id: string) => {
    setIsSaving(true);
    try {
      await db.deleteSystemUserRemote(id);
      setSystemUsers(prev => prev.filter(u => u.id !== id));
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = async (changes: Partial<GlobalSettings>) => {
    const newSettings = { ...settings, ...changes };
    setSettings(newSettings);
    setIsSaving(true);
    await db.saveSettings(newSettings);
    setIsSaving(false);
  };

  const resetMonthData = async () => {
    setIsLoading(true);
    const activeEmps = await db.getEmployees();
    setEmployees(activeEmps);

    const year = currentDate.year;
    const month = currentDate.month;
    const workingDays = getWorkingDays(year, month);

    const newData: MonthlyData = {
      id: `${year}-${String(month).padStart(2, '0')}`,
      params: { ...DEFAULT_PARAMS, year, month },
      records: activeEmps.filter(e => e.status !== 'terminated' && e.workshopId !== 'ws_weaving').map(e => {
        const dailyTarget = e.expectedDailyHours || 12;
        return {
          employeeId: e.id,
          employeeName: e.name,
          workHours: workingDays * dailyTarget,
          expectedHours: workingDays * dailyTarget,
          baseScoreSnapshot: e.standardBaseScore,
          dailyLogs: {}
        };
      })
    };
    await persistData(newData);
    setIsLoading(false);
  };

  const safeData = currentData || {
    id: 'loading',
    params: { ...DEFAULT_PARAMS, year: currentDate.year, month: currentDate.month },
    records: []
  };

  return (
    <DataContext.Provider value={{
      currentDate,
      setCurrentDate,
      currentData: safeData,
      employees,
      workshops,
      systemUsers,
      settings,
      isLoading,
      isSaving,
      updateParams,
      updateRecord,
      updateDailyLog,
      autoFillAttendance,
      addEmployee,
      updateEmployee,
      removeEmployee,
      resetMonthData,
      addWorkshopFolder,
      addWorkshop,
      deleteWorkshop,
      deleteWorkshopFolder,
      addSystemUser,
      updateSystemUser,
      deleteSystemUser,
      updateSettings
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
