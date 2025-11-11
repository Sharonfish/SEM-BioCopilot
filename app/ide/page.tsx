/**
 * IDE 主页面
 */

'use client'

import { useEffect } from 'react'
import { IDELayout } from '@/components/ide/IDELayout'
import { usePipelineStore } from '@/store/pipelineStore'
import { useEditorStore } from '@/store/editorStore'
import { useCopilotStore } from '@/store/copilotStore'

export default function IDEPage() {
  const { setPipeline, updateDataShape } = usePipelineStore()
  const { openFile } = useEditorStore()
  const { addSuggestion, updateContext } = useCopilotStore()

  // 初始化示例数据
  useEffect(() => {
    // 设置示例 pipeline
    setPipeline({
      id: 'cancer-genomics-pipeline',
      name: 'Cancer Genomics Pipeline',
      description: '癌症基因组学数据分析流程',
      currentStepIndex: 0,
      progress: 0,
      steps: [
        {
          id: 'load-data',
          name: 'Load Data',
          description: '从 CSV 文件加载基因表达数据',
          file: 'load_data.py',
          status: 'pending',
          dependencies: [],
        },
        {
          id: 'gene-mapping',
          name: 'Gene Mapping',
          description: '基因映射和注释',
          file: 'gene_mapping.py',
          status: 'pending',
          dependencies: ['load-data'],
        },
        {
          id: 'preprocess',
          name: 'Preprocess',
          description: '数据预处理和标准化',
          file: 'preprocess.py',
          status: 'pending',
          dependencies: ['gene-mapping'],
        },
        {
          id: 'train-model',
          name: 'Train Model',
          description: '训练机器学习模型',
          file: 'train.py',
          status: 'pending',
          dependencies: ['preprocess'],
        },
        {
          id: 'evaluate',
          name: 'Evaluate',
          description: '模型评估',
          file: 'evaluate.py',
          status: 'pending',
          dependencies: ['train-model'],
        },
      ],
    })

    // 设置当前数据形状
    updateDataShape({
      rows: 18234,
      cols: 20531,
    })

    // 打开示例文件
    openFile({
      name: 'preprocess.py',
      path: 'preprocess.py',
      content: `import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

def preprocess_data(df):
    """Preprocess gene expression data"""
    # Remove missing values
    df = df.dropna()
    
    # Normalize expression values
    scaler = StandardScaler()
    expression_cols = [col for col in df.columns if col.startswith('gene_')]
    df[expression_cols] = scaler.fit_transform(df[expression_cols])
    
    # Split features and labels
    X = df[expression_cols]
    y = df['label']
    
    return X, y


if __name__ == '__main__':
    # Load data
    data = load_gene_data('data/gene_expression.csv')
    
    # Preprocess
    X, y = preprocess_data(data)
    
    print(f"Processed {len(X)} samples with {X.shape[1]} features")
    print(f"Class distribution: {y.value_counts().to_dict()}")
`,
      language: 'python',
    })

    // 更新 Copilot 上下文
    updateContext({
      currentStep: 'preprocess',
      currentFile: 'preprocess.py',
      dataShape: {
        rows: 18234,
        cols: 20531,
      },
    })

    // 添加示例建议
    addSuggestion({
      id: 'filter-low-quality',
      type: 'next_step',
      title: 'Filter low-quality cells/samples',
      description: '移除具有 <500 genes 或 >5% 线粒体含量的低质量细胞/样本，以避免在 bulk 中过滤样本（~30 reads）',
      priority: 10,
      contextRelevance: 0.95,
      createdAt: new Date(),
      code: `# Single-cell normalization import scanpy as sc
sc.pp.normalize_total(data, target_sum=1e4)
sc.pp.log1p(data) # Or bulk RNA-seq import pandas as pd
counts_per_million = (df / df.sum()) * 1e6`,
    })

    addSuggestion({
      id: 'normalize-libraries',
      type: 'optimization',
      title: 'Normalize library sizes',
      description: '不同测序深度会产生技术变异。标准化（CPM、TPM 或 SCTransform）可以解释此问题。',
      priority: 8,
      contextRelevance: 0.88,
      createdAt: new Date(),
    })

    addSuggestion({
      id: 'add-column-check',
      type: 'fix',
      title: 'Add column check and rename',
      description: '检查 target 列是否存在并在 label 必要时重命名',
      priority: 6,
      contextRelevance: 0.75,
      createdAt: new Date(),
      code: `def preprocess_data(df):
    """Preprocess gene expression data"""
    # Remove missing values
    df = df.dropna()
    
    # Split features and labels
    X = df[expression_cols]
    y = df['label'] if 'label' in df else None
    
    return X, y`,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <IDELayout projectName="cancer-genomics-pipeline" />
}

