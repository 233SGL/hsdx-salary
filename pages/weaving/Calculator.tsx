import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { WeavingConfig, WeavingMonthlyData, WeavingCalculationResult, DEFAULT_WEAVING_CONFIG } from '../../weavingTypes';
import { WeavingResults } from '../../components/weaving/WeavingResults';

export const WeavingCalculator = () => {
    // TODO: 从数据库读取配置和月度数据
    const [config] = useState<WeavingConfig>(DEFAULT_WEAVING_CONFIG);
    const [monthlyData] = useState<WeavingMonthlyData>({
        netFormationRate: 75,
        equivalentOutput: 200000,
        activeMachines: 10,
        actualOperators: 17,
        operationRate: 78,
        attendanceDays: 26,
    });
    const [result, setResult] = useState<WeavingCalculationResult | null>(null);

    // 计算逻辑（与 Dashboard 相同）
    useEffect(() => {
        calculate();
    }, [config, monthlyData]);

    const calculate = () => {
        const {
            netFormationBenchmark,
            operationRateBenchmark,
            targetEquivalentOutput,
            operatorQuota,
            avgTargetBonus,
            adminTeamSize,
            operationRateBonusUnit,
            leaderCoef,
            memberCoef,
            leaderBaseSalary,
            memberBaseSalary,
        } = config;

        const {
            netFormationRate,
            equivalentOutput,
            activeMachines,
            actualOperators,
            operationRate,
        } = monthlyData;

        // 避免除以零
        if (activeMachines === 0 || actualOperators === 0 || targetEquivalentOutput === 0) {
            setResult(null);
            return;
        }

        const netFormationDiff = netFormationRate - netFormationBenchmark;
        const outputRatio = equivalentOutput / (targetEquivalentOutput * activeMachines);
        const operatorRatio = operatorQuota / actualOperators;

        const qualityBonusCoef = (netFormationDiff * 100 / 30) * outputRatio * operatorRatio;
        const qualityBonusTotal = qualityBonusCoef * avgTargetBonus * adminTeamSize;
        const operationRateDiff = operationRate - operationRateBenchmark;
        const operationBonusTotal = operationRateDiff * 100 * operationRateBonusUnit;
        const totalBonusPool = qualityBonusTotal + operationBonusTotal;
        const memberCount = adminTeamSize - 1;
        const totalCoef = leaderCoef + (memberCoef * memberCount);
        const leaderBonus = totalCoef > 0 ? (totalBonusPool / totalCoef) * leaderCoef : 0;
        const memberBonus = totalCoef > 0 ? (totalBonusPool / totalCoef) * memberCoef : 0;

        setResult({
            qualityBonusCoef,
            qualityBonusTotal,
            operationBonusTotal,
            totalBonusPool,
            totalCoef,
            leaderBonus,
            memberBonus,
            leaderTotalWage: leaderBaseSalary + leaderBonus,
            memberTotalWage: memberBaseSalary + memberBonus,
        });
    };

    return (
        <div className="h-full flex flex-col animate-fade-in-up">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 shadow-sm">
                        <Calculator size={24} />
                    </div>
                    织造工段 - 积分计算
                </h1>
                <p className="text-slate-500 text-sm">
                    查看当月积分计算结果和明细
                </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                <WeavingResults result={result} />
            </div>
        </div>
    );
};

