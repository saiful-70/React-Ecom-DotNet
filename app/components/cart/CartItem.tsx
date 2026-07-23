"use client";

import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { CartLineImage } from "@/components/shared/CartLineImage";
import { Trash2, Plus, Minus } from "lucide-react";
import Price from "@/components/shared/Price";
import { useTranslation } from "react-i18next";

export interface CartItemData {
	id: string;
	name: string;
	image: string;
	price: number;
	quantity: number;
	variant_id?: number;
	stock?: number;
	bundle_tier_id?: number;
	/** Combo slug for bundle lines, so the row can deep-link to `/combo/<slug>`. */
	bundle_slug?: string;
}

interface CartItemProps {
	item: CartItemData;
	onRemove: (id: string, variant_id?: number, bundle_tier_id?: number) => void;
	onUpdateQuantity: (
		id: string,
		quantity: number,
		variant_id?: number,
		bundle_tier_id?: number
	) => void;
	onProductClick?: (item: CartItemData) => void;
}

export function CartItem({
	item,
	onRemove,
	onUpdateQuantity,
	onProductClick,
}: CartItemProps) {
	const { t } = useTranslation();
	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity < 1) {
			onRemove(item.id, item.variant_id, item.bundle_tier_id);
		} else {
			onUpdateQuantity(
				item.id,
				newQuantity,
				item.variant_id,
				item.bundle_tier_id
			);
		}
	};

	return (
		<Card>
			<CardContent className="p-4 sm:p-6">
				{/* Mobile Layout */}
				<div className="flex flex-col sm:hidden gap-4">
					<div className="flex items-start gap-3">
						<CartLineImage
							src={item.image}
							alt={item.name}
							width={80}
							height={80}
							className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
						/>
						<div className="flex-1 min-w-0">
							<h3
								className="font-semibold text-sm line-clamp-2 cursor-pointer"
								onClick={() => onProductClick?.(item)}
							>
								{item.name}
							</h3>
							<p className="text-lg font-bold text-primary mt-1">
								<Price amount={item.price} />
							</p>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onRemove(item.id, item.variant_id, item.bundle_tier_id)}
							className="text-destructive hover:text-destructive flex-shrink-0"
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					</div>
					<div className="flex items-center justify-between">
						{item.bundle_tier_id != null ? (
							<span
								className="min-w-[2ch] text-center text-sm font-medium"
								title={t("bundle.fixedQuantity") || "Combo — fixed quantity"}
								aria-label={
									t("bundle.fixedQuantity") || "Combo — fixed quantity"
								}
							>
								×1
							</span>
						) : (
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										handleQuantityChange(item.quantity - 1)
									}
									disabled={item.quantity <= 1}
									className="h-7 w-7 p-0"
								>
									<Minus className="w-3 h-3" />
								</Button>
								<span className="min-w-[2ch] text-center text-sm">
									{item.quantity}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										handleQuantityChange(item.quantity + 1)
									}
									disabled={item.stock !== undefined && item.quantity >= item.stock}
									className="h-7 w-7 p-0"
								>
									<Plus className="w-3 h-3" />
								</Button>
							</div>
						)}
						<div className="text-right">
							<div className="text-base font-semibold">
								<Price amount={item.price * item.quantity} />
							</div>
						</div>
					</div>
				</div>

				{/* Desktop Layout */}
				<div className="hidden sm:block">
					<div className="grid grid-cols-12 gap-4 items-center">
						{/* Product Info */}
						<div className="col-span-5 flex items-center gap-4">
							<CartLineImage
								src={item.image}
								alt={item.name}
								width={80}
								height={80}
								className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
							/>
							<div className="flex-1">
								<h3
									className="font-semibold text-base line-clamp-2 cursor-pointer hover:text-primary"
									onClick={() => onProductClick?.(item)}
								>
									{item.name}
								</h3>
							</div>
						</div>

						{/* Price */}
						<div className="col-span-2">
							<Price amount={item.price} />
						</div>

						{/* Quantity */}
						<div className="col-span-2">
							{item.bundle_tier_id != null ? (
								<span
									className="min-w-[3ch] text-center text-sm font-medium"
									title={t("bundle.fixedQuantity") || "Combo — fixed quantity"}
									aria-label={
										t("bundle.fixedQuantity") || "Combo — fixed quantity"
									}
								>
									×1
								</span>
							) : (
								<div className="flex items-center gap-1">
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											handleQuantityChange(item.quantity - 1)
										}
										disabled={item.quantity <= 1}
										className="h-8 w-8 p-0"
									>
										<Minus className="w-3 h-3" />
									</Button>
									<span className="min-w-[3ch] text-center">
										{item.quantity}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											handleQuantityChange(item.quantity + 1)
										}
										disabled={item.stock !== undefined && item.quantity >= item.stock}
										className="h-8 w-8 p-0"
									>
										<Plus className="w-3 h-3" />
									</Button>
								</div>
							)}
						</div>

						{/* Total */}
						<div className="col-span-2">
							<Price amount={item.price * item.quantity} />
						</div>

						{/* Remove */}
						<div className="col-span-1 flex justify-center">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onRemove(item.id, item.variant_id, item.bundle_tier_id)}
								className="text-destructive hover:text-destructive"
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
