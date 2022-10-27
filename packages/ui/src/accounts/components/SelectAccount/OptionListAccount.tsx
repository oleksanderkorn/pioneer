import React from 'react'

import { Option, OptionsListComponent } from '@/common/components/selects'

import { AccountOption } from '../../types'

import { OptionAccount } from './OptionAccount'

interface Props {
  options: AccountOption[]
  onChange: (option: AccountOption) => void
  onOptionMouseEnter?: (option: AccountOption) => void
  onOptionMouseLeave?: () => void
  className?: string
  isForStaking?: boolean
}

export const OptionListAccount = React.memo(
  ({ options, onChange, onOptionMouseEnter, onOptionMouseLeave, className, isForStaking }: Props) => {
    const freeAccounts = options.filter((option) => (option.optionLocks ? option.optionLocks?.length === 0 : true))
    const lockedAccounts = options.filter((option) => !!option.optionLocks?.length)
    return (
      <OptionsListComponent className={className}>
        {freeAccounts.map((option) => (
          <div key={option.address} onMouseEnter={() => onOptionMouseLeave && onOptionMouseLeave()}>
            <Option
              key={option.address}
              onClick={() => {
                onChange && onChange(option)
                onOptionMouseLeave && onOptionMouseLeave()
              }}
            >
              <OptionAccount option={option} isForStaking={isForStaking} />
            </Option>
          </div>
        ))}
        {lockedAccounts.map((option) => (
          <div key={option.address} onMouseEnter={() => onOptionMouseEnter && onOptionMouseEnter(option)}>
            <Option key={option.address} onClick={() => null} disabled>
              <OptionAccount option={option} isForStaking={isForStaking} />
            </Option>
          </div>
        ))}
      </OptionsListComponent>
    )
  }
)
