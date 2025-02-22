import { useFormContext } from 'react-hook-form';

import { Checkbox } from '@ui/checkbox';
import { eventFormValues } from '@/lib/validator';
import { IsFreeCheckboxProps } from '@/types';

export default function IsFreeCheckbox({
  onCheckedChange,
}: IsFreeCheckboxProps) {
  const { register, setValue } = useFormContext<eventFormValues>();

  return (
    <div className="flex items-center mb-4">
      <Checkbox
        id="isFree"
        {...register('isFree')}
        className="mr-2 h-5 w-5 border-2 border-primary-500 cursor-pointer"
        onCheckedChange={(checked) => {
          const isChecked = checked === true;
          onCheckedChange(isChecked);
          setValue('isFree', isChecked);
          if (isChecked) {
            setValue('priceCategories', []);
          }
        }}
      />
      <label htmlFor="isFree" className="text-sm">
        Free Event?
      </label>
    </div>
  );
}
