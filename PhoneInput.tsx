"use client"
import * as React from "react";
import { LuChevronsUpDown, LuSearch } from "react-icons/lu";
import * as RPNInput from "react-phone-number-input";
import type { Props as RPNProps, Country, Value } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import {
	Button,
	Input,
	Popover,
	PopoverContent,
	PopoverTrigger,
	ScrollShadow,
	Input as NextUIInput,
	InputProps as NextUIInputProps,
} from "@nextui-org/react";

type PhoneInputProps = Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	"onChange" | "value"
> &
	Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
		onChange?: (value: RPNInput.Value | "") => void;
		onCountryChange?: (country: Country) => void;
	};

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
	React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
		({ className, onChange, onCountryChange, ...props }, ref) => {
			return (
				<RPNInput.default
					ref={ref}
					className={`flex ${className}`}
					flagComponent={FlagComponent}
					countrySelectComponent={CountrySelect}
					inputComponent={InputComponent}
					smartCaret={false}
					onChange={(value) => onChange?.(value || "")}
					{...props}
					onCountryChange={(country) => onCountryChange?.(country)}

				/>
			);
		},
	);

PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<HTMLInputElement, NextUIInputProps>(
	({ className, ...props }, ref) => (
		<NextUIInput
			variant="bordered"
			className={`rounded-r-large rounded-l-none ${className}`}
			size="lg"
			radius="lg"
			color='primary'
			classNames={{
				label: "text-black"
			}}
			{...props}
			ref={ref}
		/>
	)
);

InputComponent.displayName = "InputComponent";

interface CountrySelectOption {
	label: string;
	value: Country;
}

interface CountrySelectProps {
	disabled?: boolean;
	value: Country;
	onChange: (value: Country) => void;
	options: CountrySelectOption[];
}

const CountrySelect = ({
	disabled,
	value,
	onChange,
	options,
}: CountrySelectProps) => {

	const [searchQuery, setSearchQuery] = React.useState("");
	const searchInputRef = React.useRef<HTMLInputElement>(null);



	const handleSelect = React.useCallback(
		(country: Country) => {
			onChange(country);
		},
		[onChange]
	);

	const isEuropeanCountry = (country: Country): boolean => {
		const europeanCountries = [
			'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
			'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
			'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'IS', 'LI',
			'NO', 'CH', 'UA', 'MD', 'BY', 'RU', 'MC', 'SM', 'VA', 'AD',
			'AL', 'BA', 'ME', 'MK', 'RS', 'XK'
		];
		return europeanCountries.includes(country);
	};

	const filteredOptions = React.useMemo(() => {
		let filtered = options;

		if (searchQuery) {
			filtered = options.filter((option) =>
				option.label.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Sort with European countries first
		return filtered.sort((a, b) => {
			const aIsEuropean = isEuropeanCountry(a.value);
			const bIsEuropean = isEuropeanCountry(b.value);

			if (aIsEuropean && !bIsEuropean) return -1;
			if (!aIsEuropean && bIsEuropean) return 1;

			return a.label.localeCompare(b.label);
		});
	}, [options, searchQuery]);

	return (
		<Popover
			radius="lg"
			placement="bottom-start"
			onOpenChange={(open) => {
				if (open) {
					// Focus the search input when popover opens
					setTimeout(() => {
						searchInputRef.current?.focus();
					}, 0);
				}
			}}>
			<PopoverTrigger>
				<Button
					variant="bordered"
					className="flex gap-1 rounded-l-large rounded-r-none px-3"
					disabled={disabled}
					size="lg"
					radius="lg"
				>
					<FlagComponent country={value} countryName={value} />
					<LuChevronsUpDown
						className={`-mr-2 h-4 w-4 opacity-50 ${disabled ? "hidden" : "opacity-100"}`}
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[330px]">
				<div className="px-2 min-w-full">
					<Input
						startContent={<LuSearch />}
						ref={searchInputRef}
						radius="lg"
						color="primary"
						placeholder="Search country..."
						variant="bordered"
						className="mb-2 w-full"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<ScrollShadow className="h-[300px] w-full">
						{filteredOptions
							.filter((x) => x.value)
							.map((option) => (
								<Button
									key={option.value}
									variant="light"
									className="w-full justify-between gap-2 mb-1"
									onClick={() => handleSelect(option.value)}
								>
									<div className="flex items-center gap-2">
										<FlagComponent
											country={option.value}
											countryName={option.label}
										/>
										<span className="text-sm">{option.label}</span>
									</div>
									{option.value && (
										<span className="text-default-500 text-sm">
											{`+${RPNInput.getCountryCallingCode(option.value)}`}
										</span>
									)}
								</Button>
							))}
					</ScrollShadow>
				</div>
			</PopoverContent>
		</Popover>
	);
};

interface FlagProps {
	country: Country;
	countryName: string;
}

const FlagComponent = ({ country, countryName }: FlagProps) => {
	const Flag = flags[country];

	return (
		<span className="bg-default-200 flex h-4 w-6 overflow-hidden rounded-sm">
			{Flag && <Flag title={countryName} />}
		</span>
	);
};

FlagComponent.displayName = "FlagComponent";

export { PhoneInput };