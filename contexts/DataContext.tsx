import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MonthlyData, Employee, SalaryRecord, SystemUser, GlobalSettings } from '../types';
import { db } from '../services/db';
import { getWorkingDays } from '../services/calcService';

interface DataContextType {
  currentDate: { year: number; month: number };
  setCurrentDate: (date: { year: number; month: number }) => void;
  currentData: MonthlyData;
  employees: Employee[]; 
  systemUsers: SystemUser[]; 
  settings: GlobalSettings;
  isLoading: boolean;
  isSaving: boolean;
  updateParams: (params: Partial<MonthlyData['params']>) => void;
  updateRecord: (employeeId: string, changes: Partial<SalaryRecord>) => void;
  updateDailyLog: (employeeId: string, day: number, hours: number) => void;
  autoFillAttendance: () => Promise<void>;
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (emp: Employee) => Promise<void>;
  removeEmployee: (id: string) => Promise<void>;
  resetMonthData: () => Promise<void>;
  
  // User Management
  addSystemUser: (user: Omit<SystemUser, 'id'>) => Promise<void>;
  updateSystemUser: (user: SystemUser) => Promise<void>;
  deleteSystemUser: (id: string) => Promise<void>;
  
  // Settings
  updateSettings: (settings: Partial<GlobalSettings>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

// Updated Defaults matching the user provided image
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
        setEmployees(emps);
        setSystemUsers(users);
        setSettings(sets);
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
         // Wait for employees to load first, or at least initial boot
         if(employees.length === 0 && isLoading) return; 
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
            const activeEmps = employees.filter(e => e.status !== 'terminated');
            
            const newRecords = activeEmps
                .filter(e => !existingIds.has(e.id))
                .map(e => {
                    const dailyTarget = e.expectedDailyHours || 12;
                    return {
                        employeeId: e.id,
                        employeeName: e.name,
                        workHours: workingDays * dailyTarget, // Default to full attendance
                        expectedHours: workingDays * dailyTarget,
                        baseScoreSnapshot: e.standardBaseScore,
                        dailyLogs: {}
                    };
                });
            
            // Sync names if changed
            const updatedRecords = existingData.records.map(r => {
                const emp = employees.find(e => e.id === r.employeeId);
                return emp ? { ...r, employeeName: emp.name } : r;
            });

            const mergedData = {
                ...existingData,
                records: [...updatedRecords, ...newRecords]
            };
            
            setCurrentData(mergedData);
            if (newRecords.length > 0) db.saveMonthlyData(mergedData);
          } else {
            // Create new
            const activeEmps = employees.filter(e => e.status !== 'terminated');
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

  const autoFillAttendance = async () => {
    if (!currentData) return;
    setIsSaving(true);
    
    const year = currentDate.year;
    const month = currentDate.month;
    const daysInMonth = new Date(year, month, 0).getDate();
    const workingDays = getWorkingDays(year, month);
    
    // Explicitly type the tuples to satisfy Map constructor
    const empConfigMap = new Map<string, number>(
        employees.map(e => [e.id, e.expectedDailyHours || 12] as [string, number])
    );
    
    const updatedRecords = currentData.records.map(record => {
        const dailyTarget = empConfigMap.get(record.employeeId) || 12;
        const newLogs: Record<number, number> = {};
        let sumWork = 0;
        
        for(let d=1; d<=daysInMonth; d++) {
            const date = new Date(year, month - 1, d);
            // 0 is Sunday
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

  // === Employee CRUD ===
  const addEmployee = async (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = { ...empData, id: generateId() };
    const newEmps = [...employees, newEmp];
    setEmployees(newEmps);
    setIsSaving(true);
    await db.saveEmployees(newEmps);
    setIsSaving(false);
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

  const removeEmployee = async (id: string) => {
    const target = employees.find(e => e.id === id);
    if (!target) return;
    
    const updatedEmp = { ...target, status: 'terminated' as const };
    await updateEmployee(updatedEmp);
  };

  // === System User CRUD ===
  const addSystemUser = async (user: Omit<SystemUser, 'id'>) => {
      const newUser = { ...user, id: generateId() };
      const newUsers = [...systemUsers, newUser];
      setSystemUsers(newUsers);
      setIsSaving(true);
      await db.saveSystemUsers(newUsers);
      setIsSaving(false);
  };

  const updateSystemUser = async (user: SystemUser) => {
      const newUsers = systemUsers.map(u => u.id === user.id ? user : u);
      setSystemUsers(newUsers);
      setIsSaving(true);
      await db.saveSystemUsers(newUsers);
      setIsSaving(false);
  };

  const deleteSystemUser = async (id: string) => {
      const newUsers = systemUsers.filter(u => u.id !== id);
      setSystemUsers(newUsers);
      setIsSaving(true);
      await db.saveSystemUsers(newUsers);
      setIsSaving(false);
  };

  // === Settings ===
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
        records: activeEmps.filter(e => e.status !== 'terminated').map(e => {
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
