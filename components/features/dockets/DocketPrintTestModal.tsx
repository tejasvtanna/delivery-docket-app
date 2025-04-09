import React from 'react'
import { Docket, Product } from '@prisma/client'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { DocketPrintView } from './DocketPrintView'

interface Props {
  isOpen: boolean
  onOpenChange: () => void
  docket: Docket & { product: Product }
}

export const DocketPrintTestModal = ({
  isOpen,
  onOpenChange,
  docket
}: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='min-w-[1200px]'>
        {/* <DialogTitle>Preview</DialogTitle> */}

        <DocketPrintView docket={docket} />
      </DialogContent>
    </Dialog>
  )
}
