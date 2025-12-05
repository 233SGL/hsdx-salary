import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { WeavingConfig, DEFAULT_WEAVING_CONFIG } from '../../weavingTypes';
import { WeavingConfiguration } from '../../components/weaving/WeavingConfiguration';

export const Configuration = () => {
    const [config, setConfig] = useState<WeavingConfig>(DEFAULT_WEAVING_CONFIG);

    return (
        <div className="h-full flex flex-col animate-fade-in-up">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 shadow-sm">
                        <Settings size={24} />
                    </div>
                    织造工段 - 工段配置
                </h1>
                <p className="text-slate-500 text-sm">
                    管理织造工段计算参数和基准值
                </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                <WeavingConfiguration
                    config={config}
                    onUpdate={setConfig}
                />

                <div className="mt-6 card bg-gradient-to-br from-amber-50 to-amber-50/30 border-amber-200">
                    <div className="p-5">
                        <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                            <span className="text-amber-600">⚠️</span>
                            配置变更提示
                        </h3>
                        <p className="text-amber-800 text-sm">
                            修改这些参数将影响积分计算结果。建议在月度结算前谨慎调整，确保所有参数符合当前考核方案。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

